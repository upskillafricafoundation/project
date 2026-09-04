/* UAF Digital M&E/L — Stage 7
 * Strategic Learning, Donor Compliance & Organization-wide M&E Intelligence
 * Additive module: does not replace Setup.gs.
 */

var STAGE7_HEADERS={
  Donors:['Donor ID','Donor Name','Donor Type','Contact Person','Email','Reporting Requirements','Status','Created At'],
  Grants:['Grant ID','Donor ID','Project ID','Grant Title','Grant Number','Start Date','End Date','Award Amount','Currency','Status','Reporting Frequency','Created At'],
  DonorRequirements:['Requirement ID','Grant ID','Project ID','Requirement Type','Requirement','Due Date','Responsible Person','Evidence Required','Status','Notes','Created At'],
  ReportingDeadlines:['Deadline ID','Grant ID','Project ID','Report Type','Period Start','Period End','Due Date','Responsible Person','Status','Submitted Date','Report URL','Notes'],
  LearningQuestions:['Question ID','Project ID','Question','Why It Matters','Evidence Needed','Responsible Person','Status','Created At'],
  LearningLog:['Learning ID','Project ID','Date','Learning','Evidence','What Worked','What Did Not Work','Recommendation','Recorded By'],
  AdaptationLog:['Adaptation ID','Project ID','Date','Problem','Evidence','Adaptation','Expected Result','Actual Result','Decision','Responsible Person','Follow-up Date'],
  ResultsFramework:['Result ID','Project ID','Level','Parent Result ID','Result Statement','Indicator ID','Assumption','Means of Verification','Status'],
  RiskRegister:['Risk ID','Project ID','Date Identified','Risk','Category','Likelihood','Impact','Risk Score','Mitigation','Owner','Review Date','Status'],
  Decisions:['Decision ID','Project ID','Date','Decision','Evidence','Reason','Responsible Person','Due Date','Status','Outcome'],
  DonorReports:['Donor Report ID','Grant ID','Project ID','Report Type','Period Start','Period End','Status','Narrative URL','Financial URL','Evidence Status','Submitted Date','Comments'],
  ComplianceTracker:['Compliance ID','Grant ID','Project ID','Requirement ID','Requirement','Due Date','Evidence Status','Submission Status','Owner','Days Remaining','Compliance RAG','Notes']
};

function setupStage7(){
  var ss=SpreadsheetApp.getActive();
  Object.keys(STAGE7_HEADERS).forEach(function(n){
    var s=ss.getSheetByName(n)||ss.insertSheet(n);
    if(s.getLastRow()===0)s.appendRow(STAGE7_HEADERS[n]);
    s.setFrozenRows(1);
  });
  var settings=ss.getSheetByName('Settings');
  if(settings){
    var existing=rows_('Settings');
    var defaults={
      'Stage 7':'Strategic learning, donor compliance and organization-wide M&E intelligence',
      'Portfolio Intelligence':'Enabled',
      'Donor Compliance':'Enabled',
      'Learning & Adaptation':'Enabled'
    };
    Object.keys(defaults).forEach(function(k){if(!existing.some(function(x){return x.Key===k;}))settings.appendRow([k,defaults[k]]);});
  }
  return 'Stage 7 setup complete; existing data preserved.';
}

function stage7Portfolio_(){
  var projects=rows_('Projects');
  var beneficiaries=rows_('Beneficiaries');
  var indicators=rows_('Indicators');
  var challenges=rows_('Challenges');
  var lessons=rows_('Lessons');
  var grants=rows_('Grants');
  var deadlines=rows_('ReportingDeadlines');
  var requirements=rows_('DonorRequirements');
  var now=new Date();
  var activeProjects=projects.filter(function(p){return !['completed','inactive'].includes(String(p.Status).toLowerCase());});
  var retained=beneficiaries.filter(function(b){return ['retained','completed'].includes(String(b['Current Stage']).toLowerCase())||String(b['Retention Status']).toLowerCase()==='retained';}).length;
  var oosc=beneficiaries.filter(function(b){return String(b['School Status']).toLowerCase()==='out-of-school';}).length;
  var completed=beneficiaries.filter(function(b){return String(b['Current Stage']).toLowerCase()==='completed';}).length;
  var kpiTotal=indicators.length;
  var kpiOnTrack=indicators.filter(function(i){var t=Number(i.Target)||0,c=Number(i['Current Achievement'])||0;return t>0&&c/t>=.7;}).length;
  var due30=deadlines.filter(function(d){var x=new Date(d['Due Date']);return d.Status!=='Submitted'&&x>=now&&x<=new Date(now.getTime()+30*86400000);}).length;
  var overdue=deadlines.filter(function(d){return d.Status!=='Submitted'&&new Date(d['Due Date'])<now;}).length;
  var openRequirements=requirements.filter(function(r){return !['Complete','Completed','Submitted'].includes(String(r.Status));}).length;
  return {activeProjects:activeProjects.length,totalProjects:projects.length,beneficiaries:beneficiaries.length,oosc:oosc,retained:retained,completed:completed,retentionRate:beneficiaries.length?Math.round(retained/beneficiaries.length*10000)/100:0,indicators:kpiTotal,kpisOnTrack:kpiOnTrack,kpiPerformanceRate:kpiTotal?Math.round(kpiOnTrack/kpiTotal*10000)/100:0,openChallenges:challenges.filter(function(c){return String(c.Status).toLowerCase()!=='closed';}).length,lessonsRecorded:lessons.length,grants:grants.length,reportsDue30Days:due30,reportsOverdue:overdue,openDonorRequirements:openRequirements};
}

function stage7Learning_(){
  var lessons=rows_('LearningLog');
  var adaptations=rows_('AdaptationLog');
  var questions=rows_('LearningQuestions');
  var byProject={};
  lessons.forEach(function(x){var p=x['Project ID']||'Organization';if(!byProject[p])byProject[p]={lessons:0,adaptations:0,questions:0};byProject[p].lessons++;});
  adaptations.forEach(function(x){var p=x['Project ID']||'Organization';if(!byProject[p])byProject[p]={lessons:0,adaptations:0,questions:0};byProject[p].adaptations++;});
  questions.forEach(function(x){var p=x['Project ID']||'Organization';if(!byProject[p])byProject[p]={lessons:0,adaptations:0,questions:0};byProject[p].questions++;});
  return {totalLessons:lessons.length,totalAdaptations:adaptations.length,openQuestions:questions.filter(function(x){return String(x.Status).toLowerCase()!=='closed';}).length,byProject:byProject};
}

function stage7Compliance_(){
  var now=new Date();
  return rows_('ComplianceTracker').map(function(x){
    var due=new Date(x['Due Date']);
    var days=Math.ceil((due-now)/86400000);
    var rag=String(x['Submission Status']).toLowerCase()==='submitted'?'Green':days<0?'Red':days<=14?'Amber':'Green';
    return Object.assign({},x,{'Days Remaining':days,'Compliance RAG':rag});
  });
}

function stage7Intelligence_(){
  return {portfolio:stage7Portfolio_(),learning:stage7Learning_(),compliance:stage7Compliance_()};
}

function createStage7Record(entity,data){
  var map={donor:'Donors',grant:'Grants',donorRequirement:'DonorRequirements',reportingDeadline:'ReportingDeadlines',learningQuestion:'LearningQuestions',learning:'LearningLog',adaptation:'AdaptationLog',result:'ResultsFramework',risk:'RiskRegister',decision:'Decisions',donorReport:'DonorReports',compliance:'ComplianceTracker'};
  var sheetName=map[entity];
  if(!sheetName)throw Error('Unsupported Stage 7 entity: '+entity);
  var sheet=SpreadsheetApp.getActive().getSheetByName(sheetName);
  if(!sheet)throw Error('Run setupStage7() first.');
  var headers=STAGE7_HEADERS[sheetName];
  var id=id_('S7');
  var now=new Date();
  sheet.appendRow(headers.map(function(h){return h==='Created At'?now:(data[h]!==undefined?data[h]:(h.endsWith(' ID')?id:''));}));
  audit_('CREATE',entity,id,data);
  return {ok:true,id:id};
}

function runStage7(){
  setupStage7();
  return stage7Intelligence_();
}
