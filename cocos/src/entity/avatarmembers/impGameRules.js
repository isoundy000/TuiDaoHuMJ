"use strict";
/*-----------------------------------------------------------------------------------------
												interface
-----------------------------------------------------------------------------------------*/
var impGameRules = impGameOperation.extend({
	__init__ : function()
	{
		this._super();
		this.allTiles = const_val.CHARACTER.concat(const_val.BAMBOO);
  	this.allTiles = this.allTiles.concat(const_val.DOT);
  	this.allTiles.push(const_val.DRAGON_RED);
    // this.meld_history = {};
	  KBEngine.DEBUG_MSG("Create impGameRules");
  	},

    canOperationByKingTile:function(){
      //打出财神后是否可以操作
      if (!this.curGameRoom) {return false;}
      if (this.curGameRoom.discardKingTileIdx < 0) {
        return true
      }else if (this.serverSitNum == this.curGameRoom.discardKingTileIdx) {
        return true
      }
      return false
    },

    canOperationByTimesLimit:function(){
      // 玩家只能从其他人处获得两张牌
      var numList = [0, 0, 0, 0];
      var upTilesOps = this.curGameRoom.upTilesOpsList[this.serverSitNum];
      for(var i = 0; i < upTilesOps.length; i++){
        if(upTilesOps[i][0]["fromIdx"] != this.serverSitNum && [const_val.OP_CHOW, const_val.OP_PONG, const_val.OP_EXPOSED_KONG].indexOf(upTilesOps[i][0]["opId"]) >= 0){
          numList[upTilesOps[i][0]["fromIdx"]]++;
        }
      }
      if(numList[this.curGameRoom.lastDiscardTileFrom] >= 2){
        return false;
      }
      return true;
    },

  	getCanWinTiles:function(){
      return [];
      //听牌提示
  		var canWinTiles = [];
  		for(var i = 0; i < this.allTiles.length; i++){
  			var handTiles = this.curGameRoom.handTilesList[this.serverSitNum].concat([this.allTiles[i]]);
  			if(this.canWin(handTiles, 0)){
  				canWinTiles.push(this.allTiles[i]);
  			}
  		}
  		return canWinTiles;
  	},

  	canConcealedKong:function(tiles){
      //暗杠
  		if(this.getOneConcealedKongNum(tiles) > 0){
        return true;
      } else {
        return false;
      }
  	},

    getOneConcealedKongNum:function(tiles){
      var hashDict = {};
      for(var i = 0; i < tiles.length; i++){
        if(hashDict[tiles[i]]){
          hashDict[tiles[i]]++;
          if(hashDict[tiles[i]] >= 4){
            return tiles[i];
          }
        } else {
          hashDict[tiles[i]] = 1;
        }
      }
      return 0;
    },

  	canExposedKong:function(tiles, lastTile, seatNum){
      // if (!this.canOperationByTimesLimit()) {return false}
      // if (!this.canOperationByKingTile()) {return false}
  		var tile = 0;
  		for(var i = 0; i < tiles.length; i++){
  			if(tiles[i] == lastTile){
  				tile++;
  			}
  		}
  		if(tile >= 3){
  			return true;
  		}
  		return false;
  	},

  	canSelfExposedKong:function(upTilesList, drawTile){
  		if(this.getSelfExposedKongIdx(upTilesList, drawTile) >= 0){
  			return true;
  		}
  		return false;
  	},

  	getSelfExposedKongIdx:function(upTilesList, drawTile){
  		for(var i = 0; i < upTilesList.length; i++){
  			if(upTilesList[i].length == 3 && drawTile == upTilesList[i][0] && 
  				upTilesList[i][0] == upTilesList[i][1] && upTilesList[i][1] == upTilesList[i][2]){
  				return i;
  			}
  		}
  		return -1;
  	},

  	canPong:function(tiles, lastTile, seatNum){
      // if (!this.canOperationByTimesLimit()) {return false}
      // if (!this.canOperationByKingTile()) {return false}
      // 萧山麻将规定连续打出第二张的牌不允许碰
      // if(this.curGameRoom.lastDiscardTileNum >= 2){
      //   return false;
      // }
      // 正常碰牌逻辑
  		var tile = 0;
  		for(var i = 0; i < tiles.length; i++){
  			if(tiles[i] == lastTile){
  				tile++;
  			}
  		}
  		if(tile >= 2){
  			return true;
  		}
  		return false;
  	},

    getCanChowTilesList:function(lastTile){
      var chowTilesList = [];
      // 下面两行其实加不加都行，该方法仅在canChow返回值为true时才会被调用
      // if (!this.canOperationByTimesLimit()) {return []}
      // if (!this.canOperationByKingTile()) {return []}
      if(lastTile >= 30){
        return chowTilesList;
      }
      var tiles = this.curGameRoom.handTilesList[this.serverSitNum];
      var neighborTileNumList = [0, 0, 1, 0, 0];
      for(var i = 0; i < tiles.length; i++){
        if(tiles[i] - lastTile >= -2 && tiles[i] - lastTile <= 2){
          neighborTileNumList[tiles[i] - lastTile + 2]++;
        }
      }
      for(var i = 0; i < 3; i++){
        var tileList = [];
        for(var j = i; j < i + 3; j++){
          if(neighborTileNumList[j] > 0){
            tileList.push(lastTile - 2 + j);
          } else {
            break;
          }
        }
        // 三张连续的牌
        if(tileList.length >= 3){
          chowTilesList.push(tileList);
        }
      }
      return chowTilesList;
    },

    canChow:function(tiles, lastTile, seatNum){
      // if (!this.canOperationByTimesLimit()) {return false}
      // if (!this.canOperationByKingTile()) {return false}
      // if (this.curGameRoom.lastDiscardTileFrom !=  (seatNum + 3)%4) {return false}
      // if(lastTile >= 30){
      //   return false;
      // }
      return false
      var neighborTileNumList = [0, 0, 1, 0, 0];
      for(var i = 0; i < tiles.length; i++){
        if(tiles[i] - lastTile >= -2 && tiles[i] - lastTile <= 2){
          neighborTileNumList[tiles[i] - lastTile + 2]++;
        }
      }
      for(var i = 0; i < 3; i++){
        var tileNum = 0
        for(var j = i; j < i + 3; j++){
          if(neighborTileNumList[j] > 0){
            tileNum++;
          } else {
            break;
          }
        }
        // 三张连续的牌
        if(tileNum >= 3){
          return true;
        }
      }
      return false;
    },

  	// canWin:function(tiles){
  	// 	if (tiles.length % 3 != 2){
			// return false;
  	// 	}

   //    tiles = tiles.concat([]).sort(function(a, b){return a-b;});

  	// 	var tilesInfo = this.classifyTiles(tiles);
  	// 	var chars = tilesInfo[0];
  	// 	var bambs = tilesInfo[1];
  	// 	var dots = tilesInfo[2];
  	// 	var dragon_red = tilesInfo[3];
  	// 	var c_need1 = cutil.meld_only_need_num(chars, cutil.meld_history);
  	// 	var c_need2 = cutil.meld_with_pair_need_num(chars, cutil.meld_history);
  	// 	if (c_need1 > dragon_red && c_need2 > dragon_red){
  	// 		return false;
  	// 	}

  	// 	var b_need1 = cutil.meld_only_need_num(bambs, cutil.meld_history);
  	// 	var b_need2 = cutil.meld_with_pair_need_num(bambs, cutil.meld_history);
  	// 	if (b_need1 > dragon_red && b_need2 > dragon_red){
  	// 		return false;
  	// 	}

  	// 	var d_need1 = cutil.meld_only_need_num(dots, cutil.meld_history);
  	// 	var d_need2 = cutil.meld_with_pair_need_num(dots, cutil.meld_history);
  	// 	if (d_need1 > dragon_red && d_need2 > dragon_red){
  	// 		return false;
  	// 	}

  	// 	if(	(c_need2 + b_need1 + d_need1) <= dragon_red ||
  	// 		(c_need1 + b_need2 + d_need1) <= dragon_red ||
  	// 		(c_need1 + b_need1 + d_need2) <= dragon_red){
  	// 		return true;
  	// 	}
  	// 	return false;
  	// },
        // "平胡：没有财神的普通胡牌"
        // "暴头：财神单吊胡牌"
        // "财一飘：打出财神后的下一圈暴头胡牌"
        // "财二飘：连续打出财神后的下一圈暴头胡牌"
        // "明杠杠开：明杠杠牌后补一张牌直接胡牌"
        // "暗杠杠开：自摸杠牌后补一张牌直接胡牌"
        // "大对子：胡牌时所有牌都为刻子或杠子"
        // "大吊车：吃碰杠后只剩一张牌单吊胡牌"
        // "清一色：胡牌时全部为同一种序数牌的牌型"

        
        // "十风：从第一张开始，连续打出十张风字即可直接胡牌"

        // "七小对：由七个对子组成的胡牌"
        // "豪七：带有四张相同牌的七对子"
        // "清七对：清一色七对子（清牌）"
        // "双豪七：带有2个四张相同牌的七对子（清牌）"

        // "乱风：14张全部风牌成型后胡牌（清牌）"
        // "天胡：庄家起始14张牌直接可成型胡牌（清牌）"
        // "地胡：闲家摸第一张牌即可成型胡牌（清牌）"
        // "四道杠：有四个杠子即可直接胡牌（清牌）"

        // "1.胡牌时会按照最大的牌型判定，除清牌牌型外，其他牌型可叠加，且按叠加后的最大番数计算，同时叠加老庄番数；"
        // "2.财一票，财二飘的番数包含了暴头的1番，不会叠加计算；"
        // "3.有一个杠即额外赢1分，清牌牌型除外；"
        // "4.有财神的牌型不能直接杠开，只能杠暴，即暴头+杠开；"
        // "5.清一色，以及清牌的胡法不必暴头，其他胡牌牌型必须满足有财必暴；"
        // "6.七小对，豪七在有财神的情况下必须暴头，但不会叠加暴头的番数；财飘则额外+1/+2番；"
        // "7.完成十风后，接下来每打出一张风字牌，多加一番；十风不会叠加其他胡牌牌型。"
        
    canWin:function(handTiles, winType){ //winType 胡的类型 0-自摸 , 1-抢杠 , 2-放炮
      cc.log("===============canWin=================")
      "七小对，豪七在有财神的情况下必须暴头，但不会叠加暴头的番数；财飘则额外+1/+2番；"
      if (handTiles.length % 3 != 2){
          cc.log(handTiles)
          cc.log("手牌张数不对，现在张数：" + handTiles.length)
          return false;
      }
      handTiles = cutil.deepCopy(handTiles)
      handTiles.sort(function(a,b){return a-b;})
      var upTilesOpsList = this.curGameRoom.upTilesOpsList
      var cutIdxsList = this.curGameRoom.cutIdxsList

      var discardTilesList = this.curGameRoom.discardTilesList
      var kingTile = this.curGameRoom.kingTile

      var upTiles = []
      for (var i = 0; i < this.curGameRoom.upTilesList[this.serverSitNum].length; i++) {
        upTiles = upTiles.concat(this.curGameRoom.upTilesList[this.serverSitNum][i])
      }

      var classifyList = cutil.classifyTiles3Type(handTiles)

      var isSpecialWin = false
      if (cutil.checkIs7Pairs(handTiles, 0)) {
        var kongNum = cutil.getKongNum(handTiles)
        isSpecialWin = true
        cc.log("可以胡7对")
        cc.log("暗杠数量:",kongNum)
      }
      if (cutil.meld_with_pair_need_num(handTiles, {}) <= 0 || isSpecialWin) {
        

        var discardNum = cutil.getDiscardNum(discardTilesList, upTilesOpsList, cutIdxsList, this.serverSitNum)
        if (discardNum <= 0 && handTiles.length == 14) {
          cc.log("天/地胡")
          isSpecialWin = true
        }

        if (cutil.checkIsFlush(handTiles, upTiles, 0)) {
          cc.log("清一色")
          isSpecialWin = true
        }

        if (cutil.checkIsBigPair(handTiles, upTiles, 0, 0)) {
          cc.log("碰碰胡")
          isSpecialWin = true
        }

        var isCanEatWin = false
        if (winType == 2 && this.curGameRoom.roomMode == 1) {
            isCanEatWin = true
        }

        if (winType != 2 || isSpecialWin || isCanEatWin) {
          //单吊
          if (handTiles.length <= 2) {
            cc.log("单吊")
          }
          //杠开
          if (winType <= 0) {
            var num = cutil.getNearlyKongType(upTilesOpsList, discardTilesList, cutIdxsList, this.serverSitNum)
            if (num == 1) {
              cc.log("明杠杠开")
            } else if (num == 2) {
              cc.log("暗杠杠开")
            }
          }
        }
        cc.log('====canWin:',isSpecialWin,isCanEatWin,winType)

        if (isSpecialWin || isCanEatWin) {
          return true
        }
        if (winType != 2) {
          return true
        }
      }
      return false
    },
});
