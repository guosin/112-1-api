let myObj;


function loadCity() {
	var obj, dbParam, xmlhttp, x, opt, select;
	let city = [];
	let landDirty = []; //放土地污染資料的資訊
	let landDirty2 = [];
	let c3barAry = [];
	let c3barAry2 = []; //用來放非0的資料
	let c3pieAry = [];
	select = document.getElementById("selectCity");
	obj = [{"CITY":null}];
	dbParam = JSON.stringify(obj);
	xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			myObj = JSON.parse(this.responseText).RESPONSE;
			console.log(myObj)
			getdata(myObj);
			for (x in myObj) {
				opt = document.createElement("option");
				opt.id = myObj[x].CODE;
				opt.value = myObj[x].CODE;
				opt.innerHTML = myObj[x].NAME+"("+myObj[x].CODE+")";
				select.appendChild(opt);
			}
		}
	};
	xmlhttp.open("POST", "https://openapi.land.moi.gov.tw/WEBAPI/LandQuery/QueryCity", true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlhttp.send(dbParam);
	
}

function getdata(city) {
    let promises = [];
	let c3barAry = [];
	let c3barAry2 = [];
	const token = 'Basic dWEwMEBobC1sYW5kLmdvdi50dzp1YTBPS00wT0tNYXU=';
    console.log('getdata')
	console.log(city);
	city.forEach(function (item) {
        //我將所有的axios promise都push到ary中，forEach跑幾次ary中就有幾個axios promise
        promises.push(
            axios.post('https://api.land.moi.gov.tw/cp/api/WasteDisposal/QueryByCity', [{
                'city': item.CODE
            }], {
                headers: {
                    'Authorization': token
                }
            }).then(
                function (res) {
                    if (res.data.QUANTITY == undefined) {
                        c3barAry.push([item.NAME, 0])
                    } else c3barAry.push([item.NAME, res.data.QUANTITY])
                }
            ).catch(function (error) {
                console.log(error)
             
            })
        )
    })
    // 等到ary中的所有promise都成功，才會執行then中的程式碼，確保我要的c3barAry已經有所有的資料，程式才會去產生c3圖表
    Promise.all(promises).then(() => {
            //把quantity為0的剔除
            c3barAry.forEach((item) => {
                if (item[1] != '0') c3barAry2.push(item)
            })
            //作排序由大到小
            c3barAry2.sort(function (a, b) {
                return b[1] - a[1]
            })
            console.log(c3barAry2)
			c3_generate_bar(c3barAry2)
        })
        .catch(() => alert('getdata() error'))
}

function myFunction_change_selectCity() {
	document.getElementById("tipPara").innerHTML = "提示:請求暫無回應,請重新選擇";
	document.getElementById("selectCity").disabled = false;
  document.getElementById("selectTown").disabled = false;
  document.getElementById("selectSection").disabled = false;
}

function resetSelect(rs) {
	var i, select;
	select = document.getElementById(rs);
	for (i = select.options.length - 1 ; i > 0 ; i--)
		select.remove(i);  
}

function change_selectCity(sel) {  
	var obj, dbParam, xmlhttp, myObj, myVar, i, x, opt, select;
	
	myVar = window.setTimeout(myFunction_change_selectCity, 10000);	
	resetSelect("selectTown");
	resetSelect("selectSection");
	document.getElementById("demo").innerHTML = "";//當改變所選擇的城市就會清空查詢結果
	document.getElementById('char').innerHTML = '';//當改變所選擇的城市就會清空c3
	document.getElementById("tipPara").innerHTML = "提示:作業處理中，請稍候......";
	document.getElementById("selectCity").disabled = true;
	document.getElementById("selectTown").disabled = true;
	document.getElementById("selectSection").disabled=true;
	
	select = document.getElementById("selectTown");
	obj = [{"CITY":sel}];
	dbParam = JSON.stringify(obj);
	xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			myObj = JSON.parse(this.responseText).RESPONSE[0].TOWN;
			for (x in myObj) {
				if (x > 0 && myObj[x].CODE === myObj[x-1].CODE) {continue;}
				opt = document.createElement("option");
				opt.id = myObj[x].CODE;
				opt.value = myObj[x].CODE;
				opt.innerHTML = myObj[x].NAME+"("+myObj[x].CODE+")";
				select.appendChild(opt);
			}
			window.clearTimeout(myVar);				
			document.getElementById("tipPara").innerHTML = "提示:查1-1地號,請輸入00010001";
			document.getElementById("selectCity").disabled = false;
			document.getElementById("selectTown").disabled = false;	
			document.getElementById("selectSection").disabled=false;	
		} 
	};
	xmlhttp.open("POST", "https://openapi.land.moi.gov.tw/WEBAPI/LandQuery/QueryTown", true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlhttp.send(dbParam);
}

function myFunction_change_selectTown() {
	document.getElementById("tipPara").innerHTML = "提示:請求暫無回應或密碼錯誤，請重新選擇";
	document.getElementById("selectCity").disabled = false;
	document.getElementById("selectTown").disabled = false;
	document.getElementById("selectSection").disabled = false;	
}

function change_selectTown(sel) {  
	var obj, dbParam, xmlhttp, myObj, myVar, i, x, opt, select, city, c,p;

	

	myVar = window.setTimeout(myFunction_change_selectTown, 10000);
	resetSelect("selectSection");
	document.getElementById("demo").innerHTML = "";
	document.getElementById('char').innerHTML = '';//當改變所選擇的城市就會清空c3
	document.getElementById("tipPara").innerHTML = "提示:作業處理中，請稍候......";
	document.getElementById("selectCity").disabled = true;
	document.getElementById("selectTown").disabled = true;
	document.getElementById("selectSection").disabled = true;
	
	select = document.getElementById("selectCity");
	c = select.options[select.selectedIndex].value;
	select = document.getElementById("selectSection");
	obj = [{"CITY":c,"TOWN":sel,"ENABLE":"0"}];
	dbParam = JSON.stringify(obj);	
	xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			myObj = JSON.parse(this.responseText).RESPONSE[0].SECTION;
			for (x in myObj) {
				opt = document.createElement("option");
				opt.id = myObj[x].SEC;
				opt.value = myObj[x].UNIT+myObj[x].SEC;
				opt.innerHTML = myObj[x].NAME+"("+myObj[x].SEC+")";
				select.appendChild(opt);
			}
			window.clearTimeout(myVar);			
			document.getElementById("tipPara").innerHTML = "提示:查1-1地號,請輸入00010001";
			document.getElementById("selectCity").disabled = false;
			document.getElementById("selectTown").disabled = false;
			document.getElementById("selectSection").disabled = false;				
		} 			
	};
	
	xmlhttp.open("POST", "https://api.land.moi.gov.tw/cp/api/LandQueryTown/QueryByTown", true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	xmlhttp.setRequestHeader("Authorization", "Basic dWEwMEBobC1sYW5kLmdvdi50dzp1YTBPS00wT0tNYXU=");
	xmlhttp.send(dbParam);
}

function change_selectSection(sel) {
	document.getElementById("demo").innerHTML = "";
	document.getElementById('char').innerHTML = '';//當改變所選擇的城市就會清空c3
	//if (sel != "")
	//	document.getElementById("selectLB").style.visibility = "visible";
}

function checkNum1(obj){
 var re = /^[0-9]+$/;
 if(obj.value.length==0){return false;}
 else if (!re.test(obj.value)){
  alert("只能輸入數字");
  document.getElementById("inputNo1").value="";
 }
 else return true;

}

function checkNum2(obj){
 var re1 = /^[0-9]+$/;
 if(obj.value.length==0){return false;}
 else if (!re1.test(obj.value)){
  alert("只能輸入數字");
  document.getElementById("inputNo2").value="";
 }
 else return true;

}

function toAddZero(obj, len) {
		while(obj.value.length!=0 && obj.value.length<len && !isNaN(obj.value)){
			obj.value='0'+obj.value;
		}
  }

function change_selectType(sel) {
	document.getElementById("demo").innerHTML = "";
}

function myFunction_btn_query() {
	document.getElementById("tipPara").innerHTML = "提示:查詢中-myFunction_btn_query引起";
	document.getElementById("btnQry").disabled = false;	
}

function c3_generate(ary) {
    var chart = c3.generate({
        bindto: '#char',
        data: {
            columns: ary,
            type: 'pie'
        }
    });
}
function c3_generate_bar(ary) {
    var chart = c3.generate({
        bindto: '#char',
        data: {
            columns: ary,
            type: 'bar'
        },
        bar: {
            width: {
                ratio: 0.4 // this makes bar width 50% of length between ticks
            }
            // or
            //width: 100 // this makes bar width 100px
        }
    });
}

function btn_query() {
	var obj, dbParam, xmlhttp, myObj, myVar, x, u, ru, s, n, t, select,select2, sVal, tid, cid, txt = "",p,y=0;
	if(document.getElementById("selectCity").value==""){alert("請選擇縣市");return;}
	else if(document.getElementById("selectTown").value==""){alert("請選擇鄉鎮");return;}
	else if(document.getElementById("selectSection").value==""){alert("請選擇地段");return;}
	else if(document.getElementById("inputNo1").value==""){alert("請輸入地號母號");return;}
    else if(document.getElementById("inputNo2").value==""){alert("請輸入地號子號");return;}
    else{
	//myVar = window.setTimeout(myFunction_btn_query, 10000);
	document.getElementById("demo").innerHTML = "";
    //document.getElementById("btnQry").disabled = true;
    select = document.getElementById("selectSection");
	sVal = select.options[select.selectedIndex].value;
	u = sVal.substring(0, 2);
    s = sVal.substring(2, sVal.length);
    n=document.getElementById("inputNo1").value+document.getElementById("inputNo2").value;
    //select = document.getElementById("selectType");
	select = document.getElementById("selectCity");
	c = select.options[select.selectedIndex].value;
	obj = [{"CITY":c}];
  //obj = [{"UNIT":u,"SEC":s,"NO":n}];//以上測試完成

  dbParam = JSON.stringify(obj);
	xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {	  
            ru = JSON.parse(this.responseText).RESPONSE;//ru是用城市當參數帶入api查詢的回傳值所以一定有資料
			if ( ru ){
			for (x in ru){
            if(ru[x].UNIT==u && ru[x].SEC==s && ru[x].NO==n)
			{
			y=1;
			break;
			}
			
			}
			if(y==1){
			txt="<div class=\"container\">";
            txt+="<p><h3>查詢:</h3></p> <table class=\"table table-bordered table-striped\"><thead class=\"table-warning\"><tr><th style=\"text-align:center\">縣市</th><th style=\"text-align:center\">鄉鎮</th><th style=\"text-align:center\">地段</th><th style=\"text-align:center\">地號</th><th style=\"text-align:center\">內容</th></tr></thead>";
			select2 = document.getElementById("selectCity");
			txt += "<td align='center'>" + select2.options[select2.selectedIndex].innerHTML + "</td>";//內容(縣市)
			select2 = document.getElementById("selectTown");
			txt += "<td align='center'>" + select2.options[select2.selectedIndex].innerHTML + "</td>";//內容(鄉鎮)
			select2 = document.getElementById("selectSection");
			txt += "<td align='center'>" + select2.options[select2.selectedIndex].innerHTML + "</td>";//內容(地段)
			txt += "<td align='center'>" +ru[x].NO+ "</td>";
			txt += "<td align='center'>" +ru[x].CONTENT+ "</td></tr>";
			txt+="<tbody></tbody></table></div>";
			document.getElementById("demo").innerHTML = txt;
			}
			else{
			document.getElementById("demo").innerHTML = "<h2>查無資料</h2></div>";//只可能比對失敗查無資料
			}
			}
			}
			
			
		} 
	//xmlhttp.open("POST", "https://api.land.moi.gov.tw/sandbox/api/WasteDisposal/QueryByCity",true);
	xmlhttp.open("POST", "https://api.land.moi.gov.tw/cp/api/WasteDisposal/QueryByCity",true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.setRequestHeader("Authorization", "Basic dWEwMEBobC1sYW5kLmdvdi50dzp1YTBPS00wT0tNYXU=");
	xmlhttp.send(dbParam);
}
}
function btn_query2() {
	var obj, dbParam, xmlhttp, myObj, myVar, x, c, u, ru, pu, s, n, t, select,select2, sVal, tid, cid, txt = "",p;
	select2 = document.getElementById("selectCity");
	if(document.getElementById("selectCity").value==""){alert("請選擇縣市");return;}
	
    else{
   //myVar = window.setTimeout(myFunction_btn_query, 10000);
	document.getElementById("demo").innerHTML = "";
    //document.getElementById("btnQry").disabled = true;
    select = document.getElementById("selectSection");
	sVal = select.options[select.selectedIndex].value;
	u = sVal.substring(0, 2);
    s = sVal.substring(2, sVal.length);
    n=document.getElementById("inputNo1").value+document.getElementById("inputNo2").value;
    //select = document.getElementById("selectType");
	select = document.getElementById("selectCity");
	c = select.options[select.selectedIndex].value;
	obj = [{"CITY":c}];
  //obj = [{"UNIT":u,"SEC":s,"NO":n}];//以上測試完成

  dbParam = JSON.stringify(obj);
	xmlhttp = new XMLHttpRequest();
	xmlhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {	  
            ru = JSON.parse(this.responseText).RESPONSE;//回傳所選取的縣市土地汙染資料(關鍵)
			pu=JSON.parse(this.responseText).RETURNROWS;//為了判斷有資料回傳
			if ( ru && pu!=0){
			txt="<div class=\"container\">";
            txt+="<p><h3>查詢:</h3></p> <table class=\"table table-bordered table-striped\"><thead class=\"table-warning\"><tr><th style=\"text-align:center\">縣市</th><th style=\"text-align:center\">地段</th><th style=\"text-align:center\">地號</th><th style=\"text-align:center\">內容</th></tr></thead>";
			
			//c3主要程式碼，呈現各縣市的圓餅圖
			if(select2.options[select2.selectedIndex].value == 'A'){	
				let count1 = 0;
				let count2 = 0;
				ru.forEach((item)=>{
					if(item.CONTENT == '土地上堆置大量廢棄物及營建混合物')count1++
					else if(item.CONTENT == '地下填埋廢棄物')count2++
				})
				console.log(count1)
				console.log(count2)
				c3_generate([['土地上堆置大量廢棄物及營建混合物',count1],['地下填埋廢棄物',count2]])
			}
			else if(select2.options[select2.selectedIndex].value == 'B'){	
				let count1 = 0;
				ru.forEach((item)=>{
					let str = item.CONTENT;
					if(str.indexOf('廢棄物非法棄置場址'))count1++
					else console.log('error') 
				})
				 console.log(count1)
				 c3_generate([['廢棄物非法棄置場址',count1]])
			}
			else if(select2.options[select2.selectedIndex].value == 'D'){	
				let count1 = 0;
				let count2 = 0;
				let count3 = 0;
				let count4 = 0;
				let count5 = 0;
				ru.forEach((item)=>{
					let str = item.CONTENT;
					//console.log(item.CONTENT)
					//console.log(str.indexOf('廢棄物非法棄置場址'))
					//if(str.indexOf('學甲工業區')>-1)console.log(str.indexOf('學甲工業區'));
					if(str.indexOf('廢棄物非法棄置場址')>-1)count1++
					else if(str.indexOf('掩埋廢棄物')>-1)count2++
					else if(str.indexOf('堆置廢棄物')>-1)count3++
					else if(str.indexOf('學甲工業區')>-1)count4++
					else count5++
				})
				c3_generate([['廢棄物非法棄置場址',count1],['掩埋廢棄物',count2],['堆置廢棄物',count3],['學甲工業區',count4],['其他',count5]])
			}
			else if(select2.options[select2.selectedIndex].value == 'E'){
				let count1 =0;
				let count2 = 0;
				ru.forEach((item)=>{
					let str = item.CONTENT;
					console.log(item.CONTENT);
					if(str.indexOf('廢棄物非法棄置場址')>=0)count1++
					else if(str.indexOf('土地回填轉爐石級配料')>=0) count2++
					else console.log('other')
				})
				c3_generate([['廢棄物非法棄置場址',count1],['土地回填轉爐石級配料',count2]])
			}
			else if(select2.options[select2.selectedIndex].value == 'F'){
				let count1 =0;
				let count2 = 0;
				ru.forEach((item)=>{
					let str = item.CONTENT;
					console.log(item.CONTENT);
					if(str.indexOf('廢棄物非法棄置場址')>=0)count1++
					else if(str.indexOf('土地遭棄置大量事業廢棄物尚未完成清理')>=0) count2++
					else console.log('other')
				})
				c3_generate([['廢棄物非法棄置場址',count1],['土地遭棄置大量事業廢棄物尚未完成清理',count2]])
			}
			else if(select2.options[select2.selectedIndex].value == 'G'){
				let count1 =0;
				ru.forEach((item)=>{
					let str = item.CONTENT;
					console.log(item.CONTENT);
					if(str.indexOf('有遭非法棄置廢棄物')>=0)count1++
					else console.log('other')
				})
				c3_generate([['廢棄物非法棄置場址',count1]])
			}
			else if(select2.options[select2.selectedIndex].value == 'H'){
				let count1 = 0;
				let count2 = 0;
				let count3 = 0;
				let count4 = 0;
				ru.forEach((item)=>{
					let str = item.CONTENT;
					if(str.indexOf('廢木材')>=0)count1++
					else if(str.indexOf('遭掩埋營建混合物')>=0)count2++
					else if(str.indexOf('廢尼龍絲捲')>=0)count3++
					else count4++
				})
				c3_generate([['遭棄置大量廢木材',count1],['遭掩埋營建混合物',count2],['遭置廢尼龍絲捲',count3],['其他',count4]])
			}
			else if(select2.options[select2.selectedIndex].value == 'J'){	
				let count1 = 0;
				ru.forEach((item)=>{
					let str = item.CONTENT;
					if(str.indexOf('廢棄物非法棄置場址')>=0)count1++
					else console.log('other') 
				})
			
				 c3_generate([['廢棄物非法棄置場址',count1]])
			}
			else if(select2.options[select2.selectedIndex].value == 'Q'){	
				let count1 = 0;
				ru.forEach((item)=>{
					let str = item.CONTENT;
					if(str.indexOf('廠內堆置廢棄物')>=0)count1++
					else console.log('other') 
				})
				 c3_generate([['廠內堆置廢棄物',count1]])
			}

			
			
			
			
			
		



			for (x in ru){
            
			txt += "<td align='center'>" + select2.options[select2.selectedIndex].innerHTML + "</td>";//內容(縣市)
			txt += "<td align='center'>" +ru[x].SEC+ "</td>";
			txt += "<td align='center'>" +ru[x].NO+ "</td>";
			txt += "<td align='center'>" +ru[x].CONTENT+ "</td></tr>";
			}
			txt+="<tbody></tbody></table></div>";
			document.getElementById("demo").innerHTML = txt;
			
		
			}
			else {
				document.getElementById("demo").innerHTML = txt + "<h2>查無資料</h2></div>";
			    }
			}
			
			
		} 
	//xmlhttp.open("POST", "https://api.land.moi.gov.tw/sandbox/api/WasteDisposal/QueryByCity",true);
	xmlhttp.open("POST", "https://api.land.moi.gov.tw/cp/api/WasteDisposal/QueryByCity",true);
	xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.setRequestHeader("Authorization", "Basic dWEwMEBobC1sYW5kLmdvdi50dzp1YTBPS00wT0tNYXU=");
	xmlhttp.send(dbParam);
	}
}
function btn_clr()
{
 var n;	
 document.getElementById("selectCity").value="";
 document.getElementById("selectTown").value="";
 document.getElementById("selectSection").value="";
 document.getElementById("inputNo1").value="";
 document.getElementById("inputNo2").value="";
 document.getElementById("demo").innerHTML = "";
 document.getElementById('char').innerHTML = '';//當改變所選擇的城市就會清空c3
 getdata(myObj);

}