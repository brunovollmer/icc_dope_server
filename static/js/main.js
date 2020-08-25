$(document).ready(function() {
    window.setInterval(function () {
        var elem = document.getElementById('data-channel');
        elem.scrollTop = elem.scrollHeight;
    }, 200);

    // preview of uploaded video
    document.querySelector("input[type=file]").onchange = function(event) {
        console.log("test");
        document.getElementById('media').style.display = 'block';
      let file = event.target.files[0];
      let blobURL = URL.createObjectURL(file);
      document.querySelector("video").src = blobURL;
    }


    var optionsHidden = false;

    $('#overlay-btn').click(function () {
        $('#overlay').slideToggle();
        if (optionsHidden) {
            $('#overlay-btn').text("Optionen verbergen");
            optionsHidden = false;
        } else {
            $('#overlay-btn').text("Optionen");
            optionsHidden = true
        }
    });

    $('#start').click(function () {
        $('#overlay').slideToggle();
        $('#overlay-btn').show();
    });

    $('#stop').click(function () {
        $('#start').show();
    });

    $('#switch').click(function () {
        $('#leftVideo').toggle();
        $('#leftPlot').toggle();
        $('#rightVideo').toggle();
        $('#rightPlot').toggle();
    });

    $("#video_form").submit(function(e) {
        $("#loader").css("display", "block");
        $("#loading_overlay").css("display", "block");
        e.preventDefault();
        var form = $("#video_form")[0]
        var formData = new FormData(form);
        $.ajax({
            type: "POST",
            url: "/video",
            processData: false,
            contentType: false,
            data: formData,
            success: function(msg) {
                console.log(msg);

                $("#loader").css("display", "none");
                $("#loading_overlay").css("display", "none");
            },
            error: function(msg) {
                console.log('failure');

                $("#loader").css("display", "none");
                $("#loading_overlay").css("display", "none");
                alert("FEHLER!")
            }
        });
    })
})