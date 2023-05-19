// DECLARE VARIABLE
$("#prev").hide();
$("#next").hide();
var page_now = 1;
var label_nav = $("#nav");
var i = 1;
$(".card").draggable();

// UPLOAD PDF
$("#myPdf").on("change", function (e) {
  $("#next").show();
  $("#next").attr("disabled", false);
  $("#prev").show();
  $("#prev").attr("disabled", true);
  page_now = 1;

  // FILE PDF
  file = e.target.files[0];
  var reader = new FileReader();
  reader.readAsDataURL(e.target.files[0]);
  reader.onload = function (a) {
    embed_pdf = a.target.result;
  };

  // Hitung Jumlah Page
  var count_read = new FileReader();
  count_read.readAsBinaryString(file);
  count_read.onload = function (e) {
    count_page = count_read.result.match(/\/Type[\s]*\/Page[^s]/g).length;
    $("#nav").html("Page <b>1</b> From <b>" + count_page + "</b> Page");
  };

  render(file, "#pdfViewer");

  $(this).attr("disabled", true);
});
// END UPLOAD PDF

// SELECT PDF PAGE
$(".page-btn").on("click", function (argument) {
  var action = $(this).attr("id");
  if (action == "next") {
    render(file, "#pdfViewer", +page_now + +1);
    page_now = +page_now + +1;
    label_nav.html(
      "Page <b>" + page_now + "</b> From <b>" + count_page + "</b> Page"
    );
  } else {
    render(file, "#pdfViewer", page_now - 1);
    page_now = page_now - 1;
    label_nav.html(
      "Page <b>" + page_now + "</b> From <b>" + count_page + "</b> Page"
    );
  }

  if (page_now == count_page) {
    $("#next").attr("disabled", true);
  } else {
    $("#next").attr("disabled", false);
  }
  if (page_now == 1) {
    $("#prev").attr("disabled", true);
  } else {
    $("#prev").attr("disabled", false);
  }
  if (count_page == 1) {
    $("#next").attr("disabled", true);
  }

  for (var a = 1; a <= $(".stretch").length; a++) {
    if ($(".gen_box_" + a).attr("page") != page_now) {
      $(".gen_box_" + a).hide();
    } else {
      $(".gen_box_" + a).show();
    }
  }
});
// END SELECT PDF PAGE

// CONVERT PIXEL TO MILIMETER
function toMM(argument) {
  var result = Math.floor(argument * 0.264583);

  return result;
}
// END CONVERT PIXEL TO MILIMETER

// JQUERY UI DRAGGABLE & RESIZEABLE
$(function () {
  var offParent = $("#pdfViewer").offset();
  var offset = $(".stretch").offset();
  var pdf_height = $("#pdfViewer").height();
  $("#pdfViewer").selectable({
    containment: "#pdfViewer",
    start: function (e) {
      //get the mouse position on start
      x_begin = e.pageX - $(".row").offset().left;
      y_begin = e.pageY - parseInt($(".container").css("padding-top"));
    },
    stop: function (e) {
      //get the mouse position on stop
      x_end = e.pageX - $(".row").offset().left;
      y_end = e.pageY - parseInt($(".container").css("padding-top"));

      // Top Left -> Bottom Right
      if (x_end - x_begin >= 1 && y_end - y_begin >= 1) {
        x_fix = x_begin;
        y_fix = y_begin;
        (width = x_end - x_begin), (height = y_end - y_begin);
      }

      // Top Right -> Bottom Left
      if (x_end - x_begin < 1 && y_end - y_begin >= 1) {
        x_fix = x_end;
        y_fix = y_begin;
        (width = x_begin - x_end), (height = y_end - y_begin);
      }

      // Bottom Right -> Top Left
      if (y_end - y_begin < 1 && x_end - x_begin < 1) {
        x_fix = x_end;
        y_fix = y_end;
        (width = x_begin - x_end), (height = y_begin - y_end);
      }

      // Bottom Left -> Top Right
      if (y_end - y_begin < 1 && x_end - x_begin >= 1) {
        x_fix = x_begin;
        y_fix = y_end;
        (width = x_end - x_begin), (height = y_begin - y_end);
      }

      //append a new div and increment the class and turn it into jquery selector
      $(".canvas-here").append(
        '<div target="gen_box_' +
          i +
          '" class="stretch gen_box_' +
          i +
          '" page="' +
          page_now +
          '"><h2 class="watermark">' +
          i +
          "</h2></div>"
      );
      gen_box = $(".gen_box_" + i);

      $(".watermark").css({
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
        "text-align": "center",
        margin: 0,
        padding: "35%",
      });

      //add css to generated div and make it resizable & draggable
      $(gen_box)
        .css({
          background: "rgb(0,0,0,0)",
          width: width,
          height: height,
          position: "absolute",
          left: x_fix,
          top: y_fix,
          "z-index": 1,
          border: "1px dashed blue",
        })
        .resizable({
          containment: "#pdfViewer",
          stop: function (e) {
            // Math.floor( pxl * 0.264583 ) for convert pxl -> milimeter
            var h = toMM($("." + $(this).attr("target")).height());
            var w = toMM($("." + $(this).attr("target")).width());

            $("#" + $(this).attr("target") + "_h").html(h);
            $("#" + $(this).attr("target") + "_w").html(w);
          },
        })
        .draggable({
          containment: "#pdfViewer",
          stop: function (e) {
            var x =
              toMM(
                toMM($("." + $(this).attr("target")).offset().left) -
                  toMM($("#pdfViewer").offset().left)
              ) * 5;
            var y =
              toMM(
                toMM($("." + $(this).attr("target")).offset().top) -
                  toMM($("#pdfViewer").offset().top)
              ) * 5;

            $("#" + $(this).attr("target") + "_x").html(x);
            $("#" + $(this).attr("target") + "_y").html(y);
          },
        });

      var x =
        toMM(
          toMM($(".gen_box_" + i).offset().left) -
            toMM($("#pdfViewer").offset().left)
        ) * 5;
      var y =
        toMM(
          toMM($(".gen_box_" + i).offset().top) -
            toMM($("#pdfViewer").offset().top)
        ) * 5;

      // Math.floor( pxl * 0.264583 ) for convert pxl -> milimeter
      var h = toMM($(".gen_box_" + i).height());
      var w = toMM($(".gen_box_" + i).width());

      // set value to dialog
      $("#users tbody").append(
        "<tr id='gen_data_" +
          i +
          "' class='gen_data'>" +
          "<td>" +
          i +
          "</td>" +
          "<td> <input id='gen_box_" +
          i +
          "_email'> </td>" +
          "<td id='gen_box_" +
          i +
          "_p' >" +
          page_now +
          "</td>" +
          "<td id='gen_box_" +
          i +
          "_x' >" +
          x +
          "</td>" +
          "<td id='gen_box_" +
          i +
          "_y' >" +
          y +
          "</td>" +
          "<td id='gen_box_" +
          i +
          "_h' >" +
          h +
          "</td>" +
          "<td id='gen_box_" +
          i +
          "_w' >" +
          w +
          "</td>" +
          "<td><a id='gen_box_" +
          i +
          "_delete' target='" +
          i +
          "' class='btn btn-sm btn-danger' onclick='del_item(this)'> Delete </a></td>" +
          "</tr>"
      );
      i++;
    },
  });
});
// END JQUERY UI DRAGGABLE & RESIZEABLE

// BUTTON CLEAR DATA HIT
$("#clear-table").on("click", function (e) {
  i = 1;
  $(".gen_data").remove();
  $(".stretch").remove();
  $("#hasil_json").val("");
});

function del_item(e) {
  $("#gen_data_" + e.target).remove();
  $(".gen_box_" + e.target).remove();
}
// END BUTTON CLEAR DATA HIT

// BUTTON SUBMIT HIT
$("#submit").on("click", function (e) {
  // prepare the array
  var json_post = [];

  // for each tr on table
  for (var q = 1; q <= $(".gen_data").length; q++) {
    var object = {};
    object["email"] = $("#gen_box_" + q + "_email").val();
    object["detail"] = [];
    var detail = {
      p: parseInt($("#gen_box_" + q + "_p").html()),
      x: parseInt($("#gen_box_" + q + "_x").html()),
      y: parseInt($("#gen_box_" + q + "_y").html()),
      w: parseInt($("#gen_box_" + q + "_w").html()),
      h: parseInt($("#gen_box_" + q + "_h").html()),
    };
    object["detail"].push(detail);

    var is_new_email = true;
    for (var z = json_post.length - 1; z >= 0; z--) {
      if (json_post[z].email == $("#gen_box_" + q + "_email").val()) {
        is_new_email = false;
        json_post[z].detail.push(detail);
      }
    }

    if (is_new_email == true) {
      // push ke variable json_post kalau belum ada email yang di input
      json_post.push(object);
    }
  }

  var json_data = JSON.stringify(json_post);
  var pdf_file = document.getElementById("myPdf").files[0];

  var formData = new FormData();
  formData.append("document", pdf_file);
  formData.append("signature", json_data);

  console.log(formData.get("signature"));
  console.log(formData.get("document"));

  var url = "https://api.digitalteken.id/v2/document/upload";
  $.ajax({
    type: "POST",
    url: url,
    headers: {
      Accept: "application/json",
      apikey: "bf9KZNW3AemcqEH0FhNZgZZdPLpwWCVjlt5VWEprlAGnuGjG",
    },
    processData: false,
    contentType: false,
    mimeType: "multipart/form-data",
    data: formData,
    success: function (response) {
      console.log(response);
    },
    error: function (a, b, c) {
      console.log(a);
      console.log(b);
      console.log(c);
    },
  });
});

$(document)
  .ajaxStart(function () {
    $("#submit").html("");
    $("#submit").append(
      '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'
    );
    $("#submit").attr("disabled", true);
  })
  .ajaxStop(function () {
    $("#submit").html("Document Successfully Sent");
    $("#submit").attr("disabled", true);
  });
// END BUTTON SUBMIT HIT

// buton copy json result
$("#copy").on("click", function (e) {
  var copy_text = $("#hasil_json");

  /* Select the text field */
  copy_text.select();

  /* Copy the text inside the text field */
  document.execCommand("copy");

  /* Alert the copied text */
  alert("Copied the text: " + copy_text.val());
});
// end button copy json

// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window["pdfjs-dist/build/pdf"];
// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://mozilla.github.io/pdf.js/build/pdf.worker.js";

function render(file, layer, pageNo = false) {
  var fileReader = new FileReader();
  fileReader.onload = function (e) {
    var pdfData = new Uint8Array(this.result);
    // Using DocumentInitParameters object to load binary data.
    var loadingTask = pdfjsLib.getDocument({ data: pdfData });
    loadingTask.promise.then(
      function (pdf) {
        // Fetch the first page
        var pageNumber = pageNo ? pageNo : 1;
        var canvas = $(layer)[0];

        pdf.getPage(pageNumber).then(function (page) {
          var scale = 1;
          var viewport = page.getViewport({ scale: scale });

          // Prepare canvas using PDF page dimensions
          var context = canvas.getContext("2d");
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          // Render PDF page into canvas context
          var renderContext = {
            canvasContext: context,
            viewport: viewport,
          };

          var renderTask = page.render(renderContext);
          renderTask.promise.then(function () {});
        });
      },
      function (reason) {
        // PDF loading error
        console.log(reason);
      }
    );
  };
  fileReader.readAsArrayBuffer(file);
}
