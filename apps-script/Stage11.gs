/* UAF STAGE 11 — ADVANCED FINANCIAL & BUDGET M&E */
var STAGE11_HEADERS={
  Budgets:['Budget ID','Project ID','Grant ID','Category','Activity ID','Budget Line','Approved Amount','Currency','Period Start','Period End','Funding Source','Status','Created At'],
  Expenditures:['Expense ID','Project ID','Grant ID','Activity ID','Date','Category','Description','Amount','Currency','Funding Source','Vendor/Payee','Payment Method','Receipt URL','Entered By','Approved By','Status','Created At'],
  SelfExpenses:['Self Expense ID','Project ID','User ID','User Name','Date','Category','Description','Amount','Currency','Purpose','Personal Funding Source','Evidence URL','Status','Created At'],
  FinancialApprovals:['Approval ID','Project ID','Expense ID','Self Expense ID','Reviewer','Role','Decision','Comments','Decision Date'],
  FinancialPeriods:['Period ID','Project ID','Grant ID','Period Start','Period End','Status','Notes','Created At'],
  VarianceAlerts:['Variance Alert ID','Project ID','Budget ID','Category','Budget Amount','Actual Amount','Variance Amount','Variance %','Severity','Message','Status','Due Date','Assigned To','Created At'],
  CostMetrics:['Metric ID','Project ID','Period','Metric Type','Numerator','Denominator','Metric Value','Unit','Notes','Calculated At']
};
function setupStage11(){
  var ss=SpreadsheetApp.getActive();
  Object.keys(STAGE11_HEADERS).forEach(function(n){var s=ss.getSheetByName(n)||ss.insertSheet(n);if(s.getLastRow()==0)s.appendRow(STAGE11_HEADERS[n]);s.setFrozenRows(1);});
  var s=ss.getSheetByName('Settings');
  if(s){var old=rows_('Settings');var defaults={'Stage 11':'Advanced Financial & Budget M&E','Financial Model':'Budget → Organizational Expenditure → Variance → Cost Metrics','Self Expense Model':'Personal funds used for UAF are tracked separately from organizational expenditure','Financial Currency':'USD'};Object.keys(defaults).forEach(function(k){if(!old.some(function(x){return x.Key==k;}))s.appendRow([k,defaults[k]]);});}
  return 'Stage 11 setup complete; existing data preserved.';
}
function stage11Visible_(name,projectId){return rows_(name).filter(function(x){return !projectId||projectAllowed_(projectId)?projectAllowed_(x['Project ID']||projectId):false;});}
function n11_(v){var n=Number(v);return isNaN(n)?0:n;}
function stage11Dashboard_(pid){
  permission_('read',pid||'');
  var projects=rows_('Projects').filter(function(x){return !pid||String(x['Project ID'])==String(pid)||String(x.Code)==String(pid);});
  if(pid&&!projects.length)throw Error('Project not found or inaccessible.');
  var budgets=stage11Visible_('Budgets',pid), exps=stage11Visible_('Expenditures',pid), selfs=stage11Visible_('SelfExpenses',pid), alerts=stage11Visible_('VarianceAlerts',pid);
  var approved=budgets.reduce(function(a,x){return a+n11_(x['Approved Amount']);},0), actual=exps.filter(function(x){return String(x.Status||'').toLowerCase()!=='rejected';}).reduce(function(a,x){return a+n11_(x.Amount);},0), self= selfs.filter(function(x){return String(x.Status||'').toLowerCase()!=='rejected';}).reduce(function(a,x){return a+n11_(x.Amount);},0);
  var remaining=approved-actual, utilization=approved?Math.round(actual/approved*10000)/100:0;
  var byCategory={};budgets.forEach(function(b){var k=b.Category||b['Budget Line']||'Uncategorized';if(!byCategory[k])byCategory[k]={category:k,budget:0,actual:0,variance:0,utilization:0};byCategory[k].budget+=n11_(b['Approved Amount']);});
  exps.forEach(function(e){var k=e.Category||'Uncategorized';if(!byCategory[k])byCategory[k]={category:k,budget:0,actual:0,variance:0,utilization:0};if(String(e.Status||'').toLowerCase()!=='rejected')byCategory[k].actual+=n11_(e.Amount);});
  Object.keys(byCategory).forEach(function(k){var x=byCategory[k];x.variance=x.budget-x.actual;x.utilization=x.budget?Math.round(x.actual/x.budget*10000)/100:0;x.rag=x.actual>x.budget?'Red':x.utilization>90?'Amber':'Green';});
  var openAlerts=alerts.filter(function(x){return String(x.Status||'Open').toLowerCase()!=='resolved';});
  var health=approved===0?'Amber':utilization>100?'Red':utilization>90?'Amber':'Green';
  return {project:projects[0]||null,summary:{approvedBudget:approved,organizationalExpenditure:actual,selfExpenses:self,remainingBudget:remaining,utilization:utilization,variance:remaining,financialHealth:health,openVarianceAlerts:openAlerts.length},budgetVsActual:Object.keys(byCategory).map(function(k){return byCategory[k];}),selfExpenses:selfs,expenditures:exps,alerts:openAlerts,costMetrics:stage11CostMetrics_(pid)};
}
function stage11CostMetrics_(pid){
  var b=rows_('Beneficiaries').filter(function(x){return !pid||String(x['Project ID'])==String(pid);}), ex=stage11Visible_('Expenditures',pid), actual=ex.filter(function(x){return String(x.Status||'').toLowerCase()!=='rejected';}).reduce(function(a,x){return a+n11_(x.Amount);},0);
  var completed=b.filter(function(x){return String(x['Current Stage']).toLowerCase()==='completed';}).length;
  var enrolled=b.filter(function(x){var s=String(x['Current Stage']).toLowerCase();return ['enrolled','retained','completed'].indexOf(s)>=0;}).length;
  return [{type:'Cost per Beneficiary',value:b.length?Math.round(actual/b.length*100)/100:0,unit:'currency/beneficiary'},{type:'Cost per Enrolled/Retained',value:enrolled?Math.round(actual/enrolled*100)/100:0,unit:'currency/person'},{type:'Cost per Completed',value:completed?Math.round(actual/completed*100)/100:0,unit:'currency/completion'}];
}
function createStage11Record_(entity,data){
  var map={budget:'Budgets',expenditure:'Expenditures',selfExpense:'SelfExpenses',financialApproval:'FinancialApprovals',financialPeriod:'FinancialPeriods',varianceAlert:'VarianceAlerts',costMetric:'CostMetrics'},sheet=map[entity];
  if(!sheet)throw Error('Unsupported Stage 11 entity');
  var pid=data['Project ID']||data.projectId;permission_('create',pid||'');
  var s=SpreadsheetApp.getActive().getSheetByName(sheet),h=STAGE11_HEADERS[sheet],now=new Date(),id=id_(entity==='selfExpense'?'SELF':'FIN');
  if(entity==='expenditure'&&n11_(data.Amount)<0)throw Error('Expense amount cannot be negative.');
  if(entity==='selfExpense'&&n11_(data.Amount)<0)throw Error('Self-expense amount cannot be negative.');
  if(entity==='budget'&&n11_(data['Approved Amount'])<0)throw Error('Budget amount cannot be negative.');
  if(entity==='expenditure'&&String(data.Status||'').toLowerCase()==='approved'&&!data['Receipt URL'])throw Error('Approved organizational expenses require a receipt URL.');
  s.appendRow(h.map(function(k){if(k==='Created At'||k==='Calculated At')return now;if(k==='Expense ID'||k==='Self Expense ID'||k==='Budget ID'||k==='Approval ID'||k==='Period ID'||k==='Variance Alert ID'||k==='Metric ID')return id;return data[k]!==undefined?data[k]:'';}));
  audit_('CREATE',entity,id,data);return json_({ok:true,id:id});
}
function stage11CalculateAlerts_(pid){
  permission_('update',pid||'');
  var budgets=stage11Visible_('Budgets',pid),exps=stage11Visible_('Expenditures',pid),s=SpreadsheetApp.getActive().getSheetByName('VarianceAlerts'),created=0,by={};
  budgets.forEach(function(b){var k=String(b['Project ID'])+'|'+String(b.Category||b['Budget Line']||'Uncategorized');if(!by[k])by[k]={p:b['Project ID'],budgetId:b['Budget ID'],cat:b.Category||b['Budget Line']||'Uncategorized',budget:0,actual:0};by[k].budget+=n11_(b['Approved Amount']);});
  exps.forEach(function(e){if(String(e.Status||'').toLowerCase()==='rejected')return;var k=String(e['Project ID'])+'|'+String(e.Category||'Uncategorized');if(!by[k])by[k]={p:e['Project ID'],budgetId:'',cat:e.Category||'Uncategorized',budget:0,actual:0};by[k].actual+=n11_(e.Amount);});
  Object.keys(by).forEach(function(k){var x=by[k],v=x.budget-x.actual,pct=x.budget?Math.round((x.actual-x.budget)/x.budget*10000)/100:(x.actual?100:0);if(x.actual>x.budget){var sev=pct>=20?'High':'Medium';s.appendRow([id_('VAL'),new Date(),x.p,x.budgetId,x.cat,x.budget,x.actual,v,pct,sev,'Budget line is overspent.','Open','',actor_(),new Date()]);created++;}});
  return json_({ok:true,created:created});
}
function stage11GetAction_(a){return ['stage11','financialDashboard','budgets','expenditures','selfExpenses','financialApprovals','financialPeriods','varianceAlerts','costMetrics'].indexOf(a)>=0;}
function stage11Get_(a,e){var pid=e&&e.parameter?e.parameter.projectId||'':'';if(a==='stage11'||a==='financialDashboard')return json_({ok:true,data:stage11Dashboard_(pid)});var map={budgets:'Budgets',expenditures:'Expenditures',selfExpenses:'SelfExpenses',financialApprovals:'FinancialApprovals',financialPeriods:'FinancialPeriods',varianceAlerts:'VarianceAlerts',costMetrics:'CostMetrics'},n=map[a];permission_('read',pid);return json_({ok:true,data:stage11Visible_(n,pid)});}
function stage11PostAction_(a){return ['stage11Setup','createStage11Record','calculateFinancialAlerts'].indexOf(a)>=0;}
function stage11Post_(a,d){if(a==='stage11Setup'){permission_('update');return json_({ok:true,message:setupStage11()});}if(a==='createStage11Record')return createStage11Record_(d.entity,d.data||{});if(a==='calculateFinancialAlerts')return stage11CalculateAlerts_(d.projectId||'');}
