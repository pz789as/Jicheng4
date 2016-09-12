/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

let cv = {
  LAYER_LOAD: 0,
  LAYER_FORCE: 1,
  LAYER_PLAY: 2,
  LAYER_NODE_MOVE: 3,
  LAYER_NODE_STOP: 4,
  LAYER_NODE_BACK: 5,

  NODE_PLAY: 0,
  NODE_MOVE: 1,
  NODE_BACK: 2,
  NODE_MOVE_OVER: 3,

  NODE_EVENT_START: 0,
  NODE_EVENT_MOVE: 1,
  NODE_EVENT_END: 2,

  MOVE_CENTER: 1,
  MOVE_BACK: 2,
};

var FORCE_DATA = [//number是权重或者说是构字数量，linkDis是距离，gravity是向中间靠拢的引力，charge是每个节点之间的排斥力，出了第一行后面的几行linkDis都是有计算公式
    {number: 10, linkDis: 500, gravity: 0.5, charge: -200},
    //{number: 4, linkDis: 20, gravity: 0.05, charge: -20},
    //{number: 3, linkDis: 20, gravity: 0.05, charge: -20},
    {number: 2, linkDis: 100, gravity: 0.25, charge: -100},
    {number: 1, linkDis: 30, gravity: 0.05, charge: -50}
];//分阶段使用力聚拢所有节点s

let Dis = function(x, y){
  return Math.sqrt(x * x + y * y);
};
let DisP = function(p1, p2){
  return Dis(p1.x - p2.x, p1.y - p2.y);
};

module.exports = {
    cv,
    Dis,
    DisP,
    FORCE_DATA,
}