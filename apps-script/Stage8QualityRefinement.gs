// UAF Digital M&E/L — Stage 8 quality-score refinement
// This file intentionally uses uniquely named helpers so it can be added without replacing Stage8.gs.
function stage8QualityRefined_(projectId){
  var b=stage8Visible_('Beneficiaries',projectId),i=stage8Visible_('Indicators',projectId),f=stage8Visible_('FollowUps',projectId),e=stage8Visible_('Evidence',projectId),now=new Date();
  var completenessChecks=0,completenessPass=0,validityChecks=0,validityPass=0,consistencyChecks=0,consistencyPass=0,late=0,followupCount=f.length,duplicateCount=0,seen={};
  function check(v){return v!==undefined&&v!==null&&String(v).trim()!=='';}
  b.forEach(function(x){
    ['Full Name','Project ID','Consent','Community','Current Stage'].forEach(function(k){completenessChecks++;if(check(x[k]))completenessPass++;});
    validityChecks++;if(String(x.Consent||'').toLowerCase()==='yes')validityPass++;
    validityChecks++;var age=Number(x.Age);if(x.Age===''||x.Age===null||(!isNaN(age)&&age>=0&&age<=120))validityPass++;
    consistencyChecks++;var stage=String(x['Current Stage']||'').toLowerCase(),enrolled=check(x['Enrollment Date']),completed=check(x['Completion Date']);if((stage==='enrolled'||stage==='retained'||stage==='completed')&&enrolled||stage==='identified'||stage==='verified'||stage==='referred'||stage==='follow-up'||stage==='household empowered')consistencyPass++;
    var key=String(x['Full Name']||'').trim().toLowerCase()+'|'+String(x.Community||'').trim().toLowerCase();if(key!=='|'&&seen[key])duplicateCount++;else if(key!=='|')seen[key]=1;
  });
  i.forEach(function(x){validityChecks++;var t=Number(x.Target);if(!isNaN(t)&&t>=0)validityPass++;validityChecks++;var c=Number(x['Current Achievement']);if(!isNaN(c)&&c>=0)validityPass++;consistencyChecks++;if(String(x['Project ID']||'')&&String(x.Indicator||''))consistencyPass++;});
  f.forEach(function(x){if(x.NextFollowUp){var d=new Date(x.NextFollowUp);if(!isNaN(d)&&d<now&&String(x.Status||'').toLowerCase()!=='resolved')late++;}});
  var completeness=completenessChecks?Math.round(completenessPass/completenessChecks*10000)/100:100;
  var validity=validityChecks?Math.round(validityPass/validityChecks*10000)/100:100;
  var consistency=consistencyChecks?Math.round(consistencyPass/consistencyChecks*10000)/100:100;
  var timeliness=followupCount?Math.round((followupCount-late)/followupCount*10000)/100:100;
  var uniqueness=b.length?Math.round(Math.max(0,(b.length-duplicateCount)/b.length)*10000)/100:100;
  var overall=Math.round((completeness+validity+consistency+timeliness+uniqueness)/5*100)/100;
  var rag=overall>=90?'Green':overall>=75?'Amber':'Red';
  return {summary:{beneficiaries:b.length,indicators:i.length,followUps:f.length,evidence:e.length,completeness:completeness,validity:validity,consistency:consistency,timeliness:timeliness,uniqueness:uniqueness,overallScore:overall,RAG:rag,duplicateCount:duplicateCount,overdueFollowUps:late},method:'Dimension-specific scoring across completeness, validity, consistency, timeliness and uniqueness'};
}
function calculateRefinedQualityScore_(projectId,period){var q=stage8QualityRefined_(projectId),s=SpreadsheetApp.getActive().getSheetByName('DataQualityScores'),id=id_('DQS'),now=new Date(),p=period||Utilities.formatDate(now,Session.getScriptTimeZone(),'yyyy-MM');s.appendRow([id,projectId||'',p,q.summary.completeness,q.summary.validity,q.summary.consistency,q.summary.timeliness,q.summary.uniqueness,q.summary.overallScore,q.summary.RAG,now]);audit_('CREATE','qualityScoreRefined',id,q.summary);return {id:id,score:q.summary.overallScore,RAG:q.summary.RAG,dimensions:{completeness:q.summary.completeness,validity:q.summary.validity,consistency:q.summary.consistency,timeliness:q.summary.timeliness,uniqueness:q.summary.uniqueness}};}
