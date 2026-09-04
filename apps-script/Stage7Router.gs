/* UAF Digital M&E/L — Stage 7 API Router
 * This module centralizes Stage 7 routing so the existing doGet/doPost can
 * delegate to Stage 7 without duplicating business logic.
 *
 * Integration points in Setup.gs:
 * 1) In doGet(e), immediately after currentUser handling, add:
 *    if(stage7GetAction_(a))return stage7Get_(a,e);
 * 2) In doPost(e), immediately after parsing d/a, add:
 *    if(stage7PostAction_(a))return stage7Post_(a,d);
 */

var STAGE7_GET_ACTIONS=['stage7','portfolioIntelligence','learningIntelligence','donorCompliance','risks','decisions','deadlines','resultsFramework'];
var STAGE7_POST_ACTIONS=['stage7Setup','createStage7Record','runStage7Alerts'];

function stage7GetAction_(action){return STAGE7_GET_ACTIONS.indexOf(String(action||''))>=0;}
function stage7PostAction_(action){return STAGE7_POST_ACTIONS.indexOf(String(action||''))>=0;}

function stage7VisibleRows_(sheetName){
  return rows_(sheetName).filter(function(x){
    var p=x['Project ID'];
    return !p||projectAllowed_(p);
  });
}

function stage7Get_(action,e){
  permission_('read');
  if(action==='stage7'){
    var intelligence=stage7Intelligence_();
    return json_({ok:true,version:'7.0',intelligence:intelligence});
  }
  if(action==='portfolioIntelligence')return json_({ok:true,data:stage7Portfolio_()});
  if(action==='learningIntelligence'){
    var l=stage7Learning_();
    l.lessons=stage7VisibleRows_('LearningLog');
    l.adaptations=stage7VisibleRows_('AdaptationLog');
    l.questions=stage7VisibleRows_('LearningQuestions');
    return json_({ok:true,data:l});
  }
  if(action==='donorCompliance')return json_({ok:true,data:stage7Compliance_()});
  if(action==='risks')return json_({ok:true,data:stage7VisibleRows_('RiskRegister')});
  if(action==='decisions')return json_({ok:true,data:stage7VisibleRows_('Decisions')});
  if(action==='deadlines')return json_({ok:true,data:stage7VisibleRows_('ReportingDeadlines')});
  if(action==='resultsFramework')return json_({ok:true,data:stage7VisibleRows_('ResultsFramework')});
  return json_({ok:false,error:'Unknown Stage 7 GET action'});
}

function stage7Post_(action,d){
  if(action==='stage7Setup'){
    permission_('update');
    return json_({ok:true,message:setupStage7()});
  }
  if(action==='runStage7Alerts'){
    permission_('update');
    return json_({ok:true,data:stage7Intelligence_()});
  }
  if(action==='createStage7Record'){
    var data=d.data||{};
    var projectId=data['Project ID']||'';
    permission_('create',projectId);
    var result=createStage7Record(d.entity,data);
    return json_(result);
  }
  return json_({ok:false,error:'Unknown Stage 7 POST action'});
}
