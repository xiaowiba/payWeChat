function mobilwmtouch(obj) {
    var stoux, stouy;
    var mtoux, mtouy;
    var xdire, ydire;
    var etoux,etouy;
    var ofst=0,ofsts=0,ofstt=84;
    var th,bh,sh,h;
    var chazhi;
    obj.addEventListener('touchstart', function (e) {
        stoux = e.targetTouches[0].clientX;
        stouy = e.targetTouches[0].clientY;
    });

    obj.addEventListener('touchmove', function (e) {
        mtoux = e.targetTouches[0].clientX;
        mtouy = e.targetTouches[0].clientY;
        xdire = mtoux - stoux;
        ydire = mtouy - stouy;
        chazhi = Math.abs(xdire) - Math.abs(ydire);
        if(chazhi<0){
            var botm = obj.querySelector(".botm");
            botm.style.top = ydire+ofst+"px";
            var sel = obj.querySelector(".sel");
            sel.style.top = ydire*1.43+ofsts+"px";
            var top = obj.querySelector(".top");
            top.style.top = ydire+ofstt+"px";
            th = obj.querySelector(".t").offsetHeight;
        }
    });

    obj.addEventListener('touchend', function (e) {
        etoux = e.changedTouches[0].clientX;
        etouy = e.changedTouches[0].clientY;
        xdire = etoux - stoux;
        ydire = etouy - stouy;
        chazhi = Math.abs(xdire) - Math.abs(ydire);
        if(chazhi<0){
            var botm = obj.querySelector(".botm");
            var sel = obj.querySelector(".sel");
            var top = obj.querySelector(".top");
            if(botm.offsetTop>0){
                botm.style.top = "0px";
                sel.style.top = "0px";
                top.style.top = th+"px";
            }else{
                if(Math.abs(ydire)%28!=0 && Math.abs(ydire)%28<15){
                    top.style.top = parseInt(ydire/28)*28+ofstt+"px";
                    botm.style.top = parseInt(ydire/28)*28+ofst+"px";
                    sel.style.top = parseInt(ydire/28)*40+ofsts+"px";
                }else if(Math.abs(ydire)%28!=0 && Math.abs(ydire)%28>14){
                    if(ydire>0){
                        top.style.top = parseInt(ydire/28+1)*28+ofstt+"px";
                        botm.style.top = parseInt(ydire/28+1)*28+ofst+"px";
                        sel.style.top = parseInt(ydire/28+1)*40+ofsts+"px";
                    }else if(ydire<0){
                        top.style.top = parseInt(ydire/28-1)*28+ofstt+"px";
                        botm.style.top = parseInt(ydire/28-1)*28+ofst+"px";
                        sel.style.top = parseInt(ydire/28-1)*40+ofsts+"px";
                    }

                }
            }
            ofst = botm.offsetTop;
            ofsts = sel.offsetTop;
            ofstt = top.offsetTop;
            bh = botm.offsetHeight;
            sh = sel.offsetHeight;
            h = top.offsetHeight;
            if(ofst<-bh){
                botm.style.top = -bh+"px";
                sel.style.top = -sh+40+"px";
                top.style.top = 84 - h+"px";
                ofst = -bh;
                ofsts = -sh+40;
                ofstt = 84 - h;
            }
        }
    });

}
