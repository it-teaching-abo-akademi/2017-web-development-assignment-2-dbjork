$(function() { //Initialize listeners
    $("#toggleBtn").click(function() {
        $("#infosec").slideToggle();
        $(this).html($(this).html() == "Hide" ? "Show" : "Hide");
    });
    $('#decodeBtn').click(decode);
    $('#decodeBtn').prop('disabled', true);
    $("#vcField").prop('maxlength', 54);
    document.getElementById("vcField").oninput = codeWritten;
});

function codeWritten() { // Triggered when content changes in
    // the virtual code text field.
    // sets background of field to light gray
    // and enables the Decode button.
    setTimeout(function() {
        var fld = $("#vcField");
        var shouldDisable = true;
        var bgColor = '#ffffff';
        if (fld.val().length === 54) {
            shouldDisable = false;
            bgColor = '#ebebeb';
        }
        $("#decodeBtn").prop('disabled', shouldDisable);
        fld.css('background-color', bgColor);
    }, 4);


}

function decode() { //Triggered when Decode button is clicked
    //Parses the virtual bar code and fills
    //the corresponding fields.
    var text = $("#vcField").val();
    var type = text.slice(0, 1);
    // seprate the two first characters in the account# then group the rest 4x4
    var account = text.slice(1, 3) + " " + text.slice(3, 17).replace(/(.{4})/g, '$1 ').trim();
    var amount = parseFloat(text.slice(17, 25)) / 100;
    // Remove leading zeroes and format according to rules for
    // type respectively (No error checking atm.)
    if (type == 4) {
        //Start by removing zeroes
        var reference = "" + text.slice(28, 48).replace(/^0+/, '');
        // then group the numbers 5 by 5, starting from the end.
        var regex = /(\d+)(\d{5})/
        while (regex.test(reference)) {
            reference = reference.replace(regex, '$1 ' + '$2');
        }

    } else {
        // Remove leading zeroes and prepend with RF
        var reference = "RF" + text.slice(25, 27) +
            text.slice(27, 48).replace(/^0+/, '');
        // Group 4x4
        reference = reference.replace(/(.{4})/g, '$1 ').trim();
    }
    var duedate = new Date(text.slice(50, 52) + "/" + text.slice(52, 54) + "/" + text.slice(48, 50));
    //Error checking for due date
    if (isNaN(duedate.valueOf())) {
        duedateTxt = "None";
    } else {
        // Format date to FI standard
        var duedateTxt = duedate.getDate() +
            "." + (duedate.getMonth() + 1) + "." + duedate.getFullYear();
    }
    $("#iban").html(account);
    $("#amount").html(amount.toFixed(2));
    $("#reference").html(reference);
    $("#dueDate").html(duedateTxt);
    //Create the barcode
    JsBarcode("#barcode", text, {
        format: "CODE128C",
        lineColor: "#000000",
        height: 400,
        width: 10,
        displayValue: false
    });

}
