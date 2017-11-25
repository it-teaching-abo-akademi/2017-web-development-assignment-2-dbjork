function load(){
	document.getElementById("decodeBtn").onclick=decode;
	document.getElementById("decodeBtn").disabled=true;
	document.getElementById("toggleBtn").onclick = toggle;
	document.getElementById("vcField").oninput=codeWritten;
	document.getElementById("vcField").maxlength=54;
}
window.onload=load;
$(function(){
	$("#toggleBtn").click(function(){
		$("#infosec").slideToggle();
		$(this).html($(this).html()=="Hide"?"Show":"Hide");
	});
});

function codeWritten(){
	setTimeout(function(){
		var fld=document.getElementById("vcField");
		var shouldDisable=true;
		var bgColor='#ffffff';
		if (fld.value.length==54) {
			shouldDisable=false;
			bgColor='#ebebeb';
		}
		document.getElementById("decodeBtn").disabled=shouldDisable;
		fld.style.backgroundColor=bgColor;
	},4);

	
}
function decode(){
	var text=document.getElementById("vcField").value;
	var type = text.slice(0,1);
	var account = text.slice(1,17);
	var amount = parseFloat(text.slice(17,25))/100;
	if (type==4) {
		var reference = ""+text.slice(28,48).replace(/^0+/,'');
	} else {
		var reference = "RF"+text.slice(25,27)+text.slice(27,48).replace(/^0+/, '');
	}
	var duedate=new Date(text.slice(50,52)+"/"+text.slice(52,54)+"/"+text.slice(48,50));
	if (isNaN(duedate.valueOf())) {
		duedateTxt="None";
	} else {
		var duedateTxt=duedate.getDate()+"."+(duedate.getMonth()+1)+"."+duedate.getFullYear();
	}
	document.getElementById("iban").innerHTML=account;
	document.getElementById("amount").innerHTML=amount.toFixed(2);
	document.getElementById("reference").innerHTML=reference;
	document.getElementById("dueDate").innerHTML=duedateTxt;
	JsBarcode("#barcode", text, {
  format: "CODE128",
  lineColor: "#000000",
  width:4,
  height:100,
  displayValue: false
});

}
function toggle(){

};

