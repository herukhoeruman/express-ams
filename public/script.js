// DECLARE VARIABLE

let pageNow = 1,
  i = 1,
  iMaterai = 1,
  iStempel = 1,
  json_post = [],
  dataHolder = [],
  dataSorted = [],
  isInOrder = 0,
  pdfScale = 1,
  pdfHeight = 0,
  pdfWidth = 0,
  x = 0,
  y = 0,
  w = 0,
  h = 0,
  documentType = null,
  documentUrl = null,
  file = null,
  isConvertSuccess = false,
  isConvertProcessing = false,
  timeleft = 60,
  countDownTimer = null,
  label_nav = $("#nav"),
  today = new Date(),
  dd = String(today.getDate()).padStart(2, "0"),
  mm = String(today.getMonth() + 1).padStart(2, "0"),
  AboxHeight = $("canvas#pdfViewer").height(),
  AboxWidth = $("canvas#pdfViewer").width(),
  yyyy = today.getFullYear();

let allowedTypes = ["application/pdf"];

// Loaded via <script> tag, create shortcut to access PDF.js exports.
let pdfjsLib = window["pdfjs-dist/build/pdf"];

// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = "asset/js/pdf.worker.js";
 // "http://mozilla.github.io/pdf.js/build/pdf.worker.js";


function renderPdf(
  loadingTask,
  pageNo = false,
  firstInit = false,
  goToBox = false,
  boxFlag = null
) {
  loadingTask.promise.then(
    function (pdf) {
      let totalPages = pdf.numPages;
      // Hide box sign
      $(".stretch").each(function () {
        let a = $(this).attr("data-flag");

        if ($(".gen_box_" + a).attr("page") != pageNow) {
          $(".gen_box_" + a).hide();
        }else if($(".gen_box_" + a).attr("page") != pageNow){}
      });

      $(".stretch-materai").each(function () {
        let a = $(this).attr("data-flagm");

        if ($(".gen_boxm_" + a).attr("page") != pageNow) {
          $(".gen_boxm_" + a).hide();
        }else if($(".gen_boxm_" + a).attr("page") != pageNow){}
      });

      $(".stretch-stempel").each(function () {
        let a = $(this).attr("data-flags");

        if ($(".gen_boxs_" + a).attr("pages") != pageNow) {
          $(".gen_boxs_" + a).hide();
        }else if($(".gen_boxs_" + a).attr("pages") != pageNow){}
      });

      // Fetch the first page
      let pageNumber = pageNo ? pageNo : 1;
      let canvas = $("#pdfViewer")[0];

      pdf.getPage(pageNumber).then(function (page) {
        let viewport = page.getViewport({ scale: pdfScale });

        // Prepare canvas using PDF page dimensions
        let context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        pdfHeight = viewport.height;
        pdfWidth = viewport.width;

        // console.log("height/width", viewport.height, viewport.width);

        $("img[magic='true']").css("position", "unset");

        // Render PDF page into canvas context
        let renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        let renderTask = page.render(renderContext);
        renderTask.promise.then(function () {
          if (pageNow == totalPages) {
            $("#next").prop("disabled", true);
          } else {
            $("#next").prop("disabled", false);
          }
          if (pageNow == 1) {
            $("#prev").prop("disabled", true);
          } else {
            $("#prev").prop("disabled", false);
          }
          if (totalPages == 1) {
            $("#next").prop("disabled", true);
          }

          $(".stretch").each(function () {
            let a = $(this).attr("data-flag");

            if ($(".gen_box_" + a).attr("page") == pageNow) {
              $(".gen_box_" + a).show();
            }
          });
          $(".stretch-materai").each(function () {
            let a = $(this).attr("data-flagm");

            if ($(".gen_boxm_" + a).attr("page") == pageNow) {
              $(".gen_boxm_" + a).show();
            }
          });
          $(".stretch-stempel").each(function () {
            let a = $(this).attr("data-flags");

            if ($(".gen_boxs_" + a).attr("page") == pageNow) {
              $(".gen_boxs_" + a).show();
            }
          });

          $("#pages").val(pageNow);
          $("#total_pages").html(totalPages);

          if (firstInit) {
            if (totalPages > 1) {
              $("#button-prevnex").css("visibility", "visible");
            }

            for (let page = 1; page <= totalPages; page++) {
              $("#pages").append(
                $("<option></option>").attr("value", page).text(page)
              );
            }

            Swal.fire({
              title: "Informasi",
              icon: "info",
              confirmButtonText: "Mengerti",
              allowOutsideClick: false,
              text: "Buat kotak dengan cara klik di atas dokumen.",
            });
          }

          if (goToBox) {
            $("html, body").animate(
              {
                scrollTop: $(".gen_box_" + boxFlag).offset().top - 150,
              },
              500
            );
          }
        });
      });
    },
    function (reason) {
      // PDF loading error
      console.error(reason);

      Swal.fire({
        title: "Informasi",
        icon: "info",
        text: "Dokumen tidak dapat dibaca. Pastikan dokumen tidak dalam mode read-only atau bersandi.",
      }).then((result) => {
        if (result.isConfirmed) {
          location.reload();
        }
      });
    }
  );
}

function render(
  pageNo = false,
  firstInit = false,
  goToBox = false,
  boxFlag = null
) {
  $("#pdfViewer").css("display", "block");
  if (documentType === "application/pdf") {
    let fileReader = new FileReader();
    fileReader.onload = function (e) {
      let pdfData = new Uint8Array(this.result);
      // Using DocumentInitParameters object to load binary data.
      let loadingTask = pdfjsLib.getDocument({ data: pdfData });
      renderPdf(loadingTask, pageNo, firstInit, goToBox, boxFlag);
    };
    fileReader.readAsArrayBuffer(file);
  } else {
    let loadingTask = pdfjsLib.getDocument(documentUrl);
    renderPdf(loadingTask, pageNo, firstInit, goToBox, boxFlag);
  }
}

window.deleteItem = function (e) {
  Swal.fire({
    text: "Yakin akan melakukan ini?",
    icon: "info",
    title: "Konfirmasi",
    showCancelButton: true,
    confirmButtonText: "OK",
    cancelButtonText: "Batal",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      $("#gen_data_" + e.target).remove();
      $(".gen_box_" + e.target).remove();
      $("#users tr.gen_data").each(function (k, v) { 
        let idx = k + 1;

        $(this).attr({
          id: "gen_data_" + idx,
          "data-flag": idx,
        });

        $(this)
          .find("td > input.signer-email")
          .attr({
            id: "gen_box_" + idx + "_email",
            "data-flag": idx,
          });

        $(this)
          .find("td > div > input[type='checkbox']")
          .attr("id", "gen_box_" + idx + "_hide");
        $(this)
          .find("td > div > input[type='checkbox'] ~ label")
          .attr("for", "gen_box_" + idx + "_hide");
        $(this).find("td.kotak").text(idx);
        $(this)
          .find("td.halaman")
          .attr("id", "gen_box_" + idx + "_p");
        $(this)
          .find("td.x-cord")
          .attr("id", "gen_box_" + idx + "_x");
        $(this)
          .find("td.y-cord")
          .attr("id", "gen_box_" + idx + "_y");
        $(this)
          .find("td.h-cord")
          .attr("id", "gen_box_" + idx + "_h");
        $(this)
          .find("td.w-cord")
          .attr("id", "gen_box_" + idx + "_w");

        $(this)
          .find("td > a")
          .attr({
            id: "gen_box_" + idx + "_delete",
            target: idx,
          });
      });

      $("div.stretch").each(function (k, v) {
        let idx = k + 1;

        $(this).attr({
          "data-flag": idx,
          target: "gen_box_" + idx,
        });

        $(this).removeClass(function (index, classNames) {
          var current_classes = classNames.split(" "),
            classes_to_remove = [];
          $.each(current_classes, function (index, class_name) {
            if (/gen_box_.*/.test(class_name)) {
              classes_to_remove.push(class_name);
            }
          });
          return classes_to_remove.join(" ");
        });
        $(this).addClass("gen_box_" + idx);
        $(this).find("h2.watermark").text(idx);
      });
    }
  });
};

window.deleteItemStempel = function (e) {
  Swal.fire({
    text: "Yakin akan melakukan ini?",
    icon: "info",
    title: "Konfirmasi",
    showCancelButton: true,
    confirmButtonText: "OK",
    cancelButtonText: "Batal",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      $("#gen_datas_" + e.target).remove();
      $(".gen_boxs_" + e.target).remove();
      $("#tb_stempel tr.gen_datas").each(function (k, v) {
        //console.log("tr signature :" , k, v);
        let idxs = k + 1;

        $(this).attr({
          id: "gen_datas_" + idxs,
          "data-flags": idxs,
        });

        $(this)
          .find("td > input.signer-email")
          .attr({
            id: "gen_boxs_" + idxs + "_email",
            "data-flags": idxs,
          });
        $(this)
        $(this).find("td.kotak-stempel").text(idxs);
        $(this)
          .find("td.halaman-stempel")
          .attr("id", "gen_boxs_" + idxs + "_p");
        $(this)
          .find("td.x-cord")
          .attr("id", "gen_boxs_" + idxs + "_x");
        $(this)
          .find("td.y-cord")
          .attr("id", "gen_boxs_" + idxs + "_y");
        $(this)
          .find("td.h-cord")
          .attr("id", "gen_boxs_" + idxs + "_h");
        $(this)
          .find("td.w-cord")
          .attr("id", "gen_boxs_" + idxs + "_w");

        $(this)
          .find("td > a")
          .attr({
            id: "gen_boxs_" + idxs + "_delete",
            target: idxs,
          });
      });

      $("div.stretch-stempel").each(function (k, v) {
        let idxs = k + 1;

        $(this).attr({
          "data-flag": idxs,
          target: "gen_boxs_" + idxs,
        });

        $(this).removeClass(function (index, classNames) {
          var current_classes = classNames.split(" "),
            classes_to_remove = [];
          $.each(current_classes, function (index, class_name) {
            if (/gen_boxs_.*/.test(class_name)) {
              classes_to_remove.push(class_name);
            }
          });
          return classes_to_remove.join(" ");
        });
        $(this).addClass("gen_boxs_" + idxs);
        $(this).find("h2.watermark").text(idxs);
      });
    }
  });
};

window.deleteItemMaterai = function (e) {
  Swal.fire({
    text: "Yakin akan hapus materai ini?",
    icon: "info",
    title: "Konfirmasi",
    showCancelButton: true,
    confirmButtonText: "OK",
    cancelButtonText: "Batal",
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      $("#gen_datam_" + e.target).remove();
      $(".gen_boxm_" + e.target).remove();
      $("#tb_materai tr.gen_datam").each(function (k, v) {
        //console.log("tr materai :" , k, v);
        let idxm = k + 1;

        $(this).attr({
          id: "gen_datam_" + idxm,
          "data-flagm": idxm,
        });

        $(this)
          .find("td.e-materai")
          .attr("id", "gen_boxm_" + idxm + "_m");
        // $(this)
        //   .find("td.e-materai")
        //   .html("Materai " + idxm );
        $(this)
          .find("td.halaman-materai")
          .attr("id", "gen_boxm_" + idxm + "_p");
        $(this)
          .find("td.x-materai")
          .attr("id", "gen_boxm_" + idxm + "_x");
        $(this)
          .find("td.y-materai")
          .attr("id", "gen_boxm_" + idxm + "_y");

        $(this)
          .find("td > a")
          .attr({
            id: "gen_boxm_" + idxm + "_delete",
            target: idxm,
          });
      });

      $("div.stretch-materai").each(function (k, v) {
        let idxm = k + 1;

        $(this).attr({
          "data-flagm": idxm,
          target: "gen_boxm_" + idxm,
        });

        $(this).removeClass(function (index, classNames) {
          var current_classes = classNames.split(" "),
            classes_to_remove = [];
          $.each(current_classes, function (index, class_name) {
            if (/gen_boxm_.*/.test(class_name)) {
              classes_to_remove.push(class_name);
            }
          });
          return classes_to_remove.join(" ");
        });
        $(this).addClass("gen_boxm_" + idxm);
        $(this).find("h2.watermark").text(idxm);
      });
    }
  });
};



function resetData() {
  i = 1;
  iMaterai = 1;
  iStempel = 1;
  $(".gen_data").remove();
  $(".stretch").remove();
  $(".card-signers").css("display", "none");
  $("#is_in_order").prop("checked", false);
  if ($("#qrChecker").is(":checked")) {
    $("#qrChecker").trigger("click");
  }
  $("#expiredDate").val("");
}
function resetDataMaterai() {
  i = 1;
  iMaterai = 1;
  iStempel = 1;
  $(".gen_datam").remove();
  $(".stretch-materai").remove();
  $(".card-signers").css("display", "none");
  $("#is_in_order").prop("checked", false);
  if ($("#qrChecker").is(":checked")) {
    $("#qrChecker").trigger("click");
  }
  $("#expiredDate").val("");
}
function resetDataStemple() {
  i = 1;
  iMaterai = 1;
  iStempel = 1;
  $(".gen_datas").remove();
  $(".stretch-stempel").remove();
  $(".card-signers").css("display", "none");
  $("#is_in_order").prop("checked", false);
  if ($("#qrChecker").is(":checked")) {
    $("#qrChecker").trigger("click");
  }
  $("#expiredDate").val("");
}

function uploadDocument() {
  let signature = JSON.stringify(json_post);

  if ($("#qrChecker").is(":checked")) {
    if ($("#showQrcode").val() == "") {
      return Swal.fire({
        title: "Dokumen Gagal Diproses",
        icon: "info",
        text: "Mohon Pilih Halaman QR",
        confirmButtonText: "Tutup",
        allowOutsideClick: false,
      });
    }
    if ($("#qrcodePosition").val() == "") {
      return Swal.fire({
        title: "Dokumen Gagal Diproses",
        icon: "info",
        text: "Mohon Pilih Posisi QR",
        confirmButtonText: "Tutup",
        allowOutsideClick: false,
      });
    }
  }

  if ($("#is_in_order").is(":checked")) {
    dataSorted = [];

    $(".signer-order").each(function () {
      dataSorted.push(dataHolder[$(this).html()]);
    });

    signature = JSON.stringify(dataSorted);
  }

  let docFile = document.getElementById("myPdf").files[0];

  let formData = new FormData();
  formData.append("document", docFile);
  formData.append("signature", signature);
  formData.append("is_in_order", isInOrder);
  formData.append("expired_date", $("#expiredDate").val());
  formData.append("show_qrcode", $("#qrChecker").is(":checked") ? 1 : 0);
  formData.append(
    "qrcode_position",
    $("#qrcodePosition").val() == ""
      ? "bottom-right"
      : $("#qrcodePosition").val()
  );
  formData.append(
    "qrcode_page",
    $("#showQrcode").val() == "" ? "single" : $("#showQrcode").val()
  );

  if (documentUrl !== null) {
    formData.append(
      "converted_filename",
      documentUrl.substring(documentUrl.lastIndexOf("/") + 1)
    );
    formData.append("document_url", documentUrl);
  }

  $.ajax({
    type: "POST",
    url: home_url + "/ajax/document/upload",
    headers: {
      Accept: "application/json",
      "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
    },
    processData: false,
    dataType: "json",
    contentType: false,
    mimeType: "multipart/form-data",
    data: formData,
    beforeSend: function () {
      $("#doc_signers_confirmation").modal("hide");
      $("#submit").html(
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>'
      );
      $("#submit").attr("disabled", true);
      $("label[for='myPdf']").css({
        background: "none",
      });
      $(".canvas-here").css({
        background: "none",
      });
    },
    success: function (response) {
      if (response.status) {
        window.onbeforeunload = null;
        Swal.fire({
          title: "Berhasil",
          text: "Dokumen telah diterima dan pemberitahuan telah dikirimkan ke penandatangan.",
          icon: "success",
          showCancelButton: false,
          confirmButtonText: "OK",
          allowOutsideClick: false,
        }).then((result) => {
          if (result.isConfirmed) {
            window.location = home_url + "/documents/show/" + response.data;
          }
        });
      } else {
        $("#submit").html("Kirim");
        $("#submit").attr("disabled", false);
        Swal.fire({
          icon: "error",
          text: response.message,
        });
      }
    },
    error: function (res, message, c) {
      $("#submit").html("Kirim");
      $("#submit").attr("disabled", false);
      Swal.fire({
        title: "Informasi",
        icon: "error",
        confirmButtonText: "Tutup",
        text: "Gagal mengunggah dokumen.",
      });
    },
  });
}

window.addEventListener("load", function () {
  $("#clear-table").on("click", function (e) {
    Swal.fire({
      title: "Konfirmasi",
      text: "Yakin akan mengulang?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        resetData();
      }
    });
  });
  $("#clear-table-materai").on("click", function (e) {
    Swal.fire({
      title: "Konfirmasi",
      text: "Yakin akan mengulang?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        resetDataMaterai();
      }
    });
  });
  $("#clear-table-stempel").on("click", function (e) {
    Swal.fire({
      title: "Konfirmasi",
      text: "Yakin akan mengulang?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "OK",
      cancelButtonText: "Batal",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        resetDataStemple();
      }
    });
  });

  // UPLOAD PDF
  $("input[type='file']").on("change", function (e) {
    // FILE PDF
    file = e.target.files[0];

    let maxSize = 102400 * 1024; // convert from KB to Bytes
    $(".canvas-here").css({
      background: "none",
    });

    if (allowedTypes.indexOf(file.type) < 0) {
      Swal.fire({
        title: "Informasi",
        icon: "error",
        confirmButtonText: "Tutup",
        allowOutsideClick: false,
        text: "Tipe berkas " + file.type + " tidak diijinkan",
      });
      return;
    }

    if (file.size >= maxSize) {
      Swal.fire({
        title: "Informasi",
        icon: "error",
        confirmButtonText: "Tutup",
        allowOutsideClick: false,
        text:
          "Ukuran berkas tidak diijinkan. Maksimal " +
          maxSize / 1024 / 1024 +
          "MB",
      });
      return;
    }

    if (file.size < 51200 * 1024) {
      timeleft = 30;
    }

    documentType = file.type;

    window.onbeforeunload = function (event) {
      return "You have unsaved changes!";
    };

    $("label[for='myPdf']").css({
      background: "none",
    });

    if (file.type === "application/pdf") {
      resetData();
      $("#next").attr("disabled", false);
      $("#prev").attr("disabled", true);
      pageNow = 1;
      $("#fileUploadForm").css("display", "none");
      render(false, true);
      return;
    }

    let formData = new FormData();
    formData.append("document", file);

    $.ajax({
      type: "POST",
      url: home_url + "/ajax/document/convert",
      headers: {
        Accept: "application/json",
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr("content"),
      },
      processData: false,
      dataType: "json",
      contentType: false,
      mimeType: "multipart/form-data",
      data: formData,
      beforeSend: function () {
        let timerInterval;
        Swal.fire({
          title: "Dokumen Sedang Diproses",
          html: "Dokumen anda diproses dalam <b></b> detik",
          timer: 60000,
          timerProgressBar: true,
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
            timerInterval = setInterval(() => {
              const content = Swal.getHtmlContainer();
              if (content) {
                const b = content.querySelector("b");
                if (b) {
                  b.textContent = Swal.getTimerLeft() / 1000;
                }
              }
            }, 100);
          },
          willClose: () => {
            clearInterval(timerInterval);
          },
        }).then((result) => {
          /* Read more about handling dismissals below */
          if (result.dismiss === Swal.DismissReason.timer) {
            Swal.fire({
              title: "Dokumen Gagal Diproses",
              icon: "info",
              text: "Pastikan dokumen tidak dalam mode read-only atau bersandi.",
              confirmButtonText: "Tutup",
              allowOutsideClick: false,
            }).then((result) => {
              location.reload();
            });
          }
        });
      },
      success: function (response) {
        documentUrl = response.data;
        isConvertProcessing = true;
        $("#pdfViewer").css("display", "block");
        setTimeout(function () {
          $("#fileUploadForm").css("display", "none");
          getConvertDocument();
        }, 1000);
      },
      error: function (res, message, c) {
        $("label[for='myPdf']").css({
          background: "#f5f5f5",
        });
        Swal.fire({
          title: "Informasi",
          icon: "error",
          confirmButtonText: "Tutup",
          allowOutsideClick: false,
          text: "Gagal mengunggah dokumen.",
        });
      },
    });
  });
  // END UPLOAD PDF

  $(document).on("change", "#pages", function (e) {
    pageNow = parseInt($(this).val());
    render(pageNow);
  });

  // SELECT PDF PAGE
  $(".page-btn").on("click", function (args) {
    $(this).prop("disabled", true);

    let action = $(this).attr("id");

    if (action == "next") {
      pageNow = pageNow + 1;
    } else {
      pageNow = pageNow - 1;
    }

    render(pageNow);
  });
  // END SELECT PDF PAGE
  function getDPI() {
    var div = document.createElement("div");
    div.style.height = "1in";
    div.style.width = "1in";
    div.style.top = "-100%";
    div.style.left = "-100%";
    div.style.position = "absolute";

    document.body.appendChild(div);

    var result = div.offsetHeight;

    document.body.removeChild(div);

    return result;
  }
  // JQUERY UI DRAGGABLE & RESIZEABLE
  $(function () {
    $(document).on("click", "#pdfViewer", (e) => {
      let posX = $("#pdfViewer").offset().left,
        posY = $("#pdfViewer").offset().top,
        i = $("#users tr.gen_data").length + 1;
      //append a new div and increment the class and turn it into jquery selector
      $(".canvas-here").append(
        '<div data-flag="' +
          i +
          '" target="gen_box_' +
          i +
          '" class="stretch gen_box_' +
          i +
          '" page="' +
          pageNow +
          '"><h2 class="watermark">' +
          i +
          "</h2></div>"
      );
      gen_box = $(".gen_box_" + i);

      let dpi = getDPI();
      let AboxWidth = $("canvas#pdfViewer").width(),
        AboxHeight = $("canvas#pdfViewer").height(),
        ApercentWidth =
          (((e.pageX - posX) * 25.4) / dpi / ((AboxWidth * 25.4) / dpi)) * 100,
        xPixel = (ApercentWidth / 100) * (pdfWidth * 0.352778);

      (ApercentHeight =
        (((e.pageY - posY) * 25.4) / dpi / ((AboxHeight * 25.4) / dpi)) * 100),
        (yPixel = (ApercentHeight / 100) * (pdfHeight * 0.352778));
      // 25.4 = 1 inch
      // dpi = dot per inch
      (widthPercent = ((100 * 25.4) / dpi / ((AboxWidth * 25.4) / dpi)) * 100),
        (widthPixel = (widthPercent / 100) * (pdfWidth * 0.352778)),
        (heightPercent =
          ((50 * 25.4) / dpi / ((AboxHeight * 25.4) / dpi)) * 100),
        (heightPixel = (heightPercent / 100) * (pdfHeight * 0.352778));

      console.log(e.pageX - posX, e.pageY - posY);
      //add css to generated div and make it resizable & draggable
      $(gen_box)
        .css({
          background: "rgb(0,0,0,0)",
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
          width: 100,
          height: 50,
          position: "absolute",
          left: e.pageX - posX,
          top: e.pageY - posY + 70,
          "z-index": 1,
          border: "1px dashed #03738C",
          cursor: "move",
        })
        .resizable({
          containment: "#pdfViewer",
          aspectRatio: true,
          stop: function (e) {
            widthPercent =
              (($("." + $(this).attr("target")).width() * 25.4) /
                dpi /
                ((AboxWidth * 25.4) / dpi)) *
              100;
            widthPixel = (widthPercent / 100) * (pdfWidth * 0.352778);

            heightPercent =
              (($("." + $(this).attr("target")).height() * 25.4) /
                dpi /
                ((AboxHeight * 25.4) / dpi)) *
              100;
            heightPixel = (heightPercent / 100) * (pdfHeight * 0.352778);

            h = Math.round(heightPixel);
            w = Math.round(widthPixel);
            //console.log("height:" + h + "width :"+ w );

            $("#" + $(this).attr("target") + "_h").html(h);
            $("#" + $(this).attr("target") + "_w").html(w);
          },
        })
        .draggable({
          containment: "#pdfViewer",
          stop: function (e) {
            ApercentWidth =
              ((($(this).offset().left - $(this).parent().offset().left) *
                25.4) /
                dpi /
                ((AboxWidth * 25.4) / dpi)) *
              100;
            xPixel = (ApercentWidth / 100) * (pdfWidth * 0.352778);

            ApercentHeight =
              ((($(this).offset().top - $(this).parent().offset().top) * 25.4) /
                dpi /
                ((AboxHeight * 25.4) / dpi)) *
              100;
            yPixel = (ApercentHeight / 100) * (pdfHeight * 0.352778);

            x = Math.round(xPixel);
            y = Math.round(yPixel);

            console.log(xPixel, yPixel);
            console.log($(this).position().left, $(this).position().top);
            $("#" + $(this).attr("target") + "_x").html(x);
            $("#" + $(this).attr("target") + "_y").html(y);
          },
        });

      x = xPixel;
      y = yPixel;
      h = heightPixel;
      w = widthPixel;

      $(".card-signers").removeClass("d-none");

      // set value to dialog
      $("#users tbody").append(
        "<tr id='gen_data_" + i + "' data-flag='" + i + "' class='gen_data'>" + 
          "<td>" + 
            "<input autocomplete='off' data-flag='" + i + "' data-page='" + pageNow + "' style='width: 100%; border: 1px solid #e5e5e5; border-radius:40px' placeholder='Ketik email disini' class='signer-email form-control' id='gen_box_" + i + "_email'>"+
            "<div class='custom-control custom-checkbox' style='margin-top:10px'><input type='checkbox' class='custom-control-input' id='gen_box_" + i + "_hide' hidden> <label class='custom-control-label' for='gen_box_" + i + "_hide' style='font-size: 11px; padding-top: 3px;' hidden>Sembunyikan</label></div> </td>" +
          "<td class='text-center kotak'>" + i + "</td>" +
          "<td class='text-center halaman' id='gen_box_" + i + "_p' >" + pageNow + "</td>" +
          "<td class='x-cord' id='gen_box_" + i + "_x' >" + Math.round(x) + "</td>" +
          "<td class='y-cord' id='gen_box_" + i + "_y' >" + Math.round(y) + "</td>" +
          "<td class='h-cord' id='gen_box_" + i + "_h' >" + Math.round(h) + "</td>" +
          "<td class='w-cord' id='gen_box_" + i + "_w' >" + Math.round(w) + "</td>" +
          "<td align='center'><a id='gen_box_" + i + "_delete' target='" + i + "' class='btn btn-sm btn-danger' onclick='window.deleteItem(this)'><i class='fas fa-trash'></i></a></td>" +
        "</tr>"
      );
      i++;

      $("#signer_lists").scrollTop($("#signer_lists")[0].scrollHeight);
    });

    $(document).on("click", "#materai", (e) => {
      console.log("add click");
      let posX = $("#pdfViewer").offset().left;
      let posY = $("#pdfViewer").offset().top; 
      iMaterai = $("#tb_materai tr.gen_datam").length + 1;
      console.log("posX :", posX, "posY :", posY);
      //append a new div and increment the class and turn it into jquery selector
      $(".canvas-here").append(
        '<div data-flagm="' + iMaterai + '" target="gen_boxm_' + iMaterai + '" class="stretch-materai gen_boxm_' + iMaterai + '" page="' + pageNow + '">' + 
        '<h2 class="watermark">' + iMaterai + "</h2></div>"
      );
      gen_boxm = $(".gen_boxm_" + iMaterai);

      let dpi = getDPI();
      let AboxWidth = $("canvas#pdfViewer").width(),
        AboxHeight = $("canvas#pdfViewer").height(),
        ApercentWidth =
          (((e.pageX - posX) * 25.4) / dpi / ((AboxWidth * 25.4) / dpi)) * 100,
        xPixel = (ApercentWidth / 100) * (pdfWidth * 0.352778);

      (ApercentHeight =
        (((e.pageY - posY) * 25.4) / dpi / ((AboxHeight * 25.4) / dpi)) * 100),
        (yPixel = (ApercentHeight / 100) * (pdfHeight * 0.352778));
      // 25.4 = 1 inch
      // dpi = dot per inch
      (widthPercent = ((100 * 25.4) / dpi / ((AboxWidth * 25.4) / dpi)) * 100),
        (widthPixel = (widthPercent / 100) * (pdfWidth * 0.352778)),
        (heightPercent =
          ((50 * 25.4) / dpi / ((AboxHeight * 25.4) / dpi)) * 100),
        (heightPixel = (heightPercent / 100) * (pdfHeight * 0.352778));

      console.log(e.pageX - posX, e.pageY - posY);
      //add css to generated div and make it resizable & draggable
      var spanMaterai = $("<span>E-Materai</span>").css({
        "align-self": "center", // vertikal di tengah box
        "justify-self": "center", // horizontal di tengah box
        "position": "absolute", // absolute pada elemen span
        "top": "10%",
        "left": "50%", 
        "transform": "translate(-50%, -50%)",
        "font-size": "11px"
      });
      $(gen_boxm)
        .css({
          background: "rgb(0,0,0,0)",
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
          width: 100,
          height: 100,
          position: "absolute",
          left: 200, //e.pageX - posX,
          top: 200, //e.pageY - posY + 70,
          "z-index": 1,
          border: "1px dashed #03738C",
          cursor: "move",
        })
        .append(spanMaterai)        
        .draggable({
          containment: "#pdfViewer",
          stop: function (e) {
            ApercentWidth =
              ((($(this).offset().left - $(this).parent().offset().left) *
                25.4) /
                dpi /
                ((AboxWidth * 25.4) / dpi)) *
              100;
            xPixel = (ApercentWidth / 100) * (pdfWidth * 0.352778);

            ApercentHeight =
              ((($(this).offset().top - $(this).parent().offset().top) * 25.4) /
                dpi /
                ((AboxHeight * 25.4) / dpi)) *
              100;
            yPixel = (ApercentHeight / 100) * (pdfHeight * 0.352778);

            x = Math.round(xPixel * 2.83464566929134);
            y = Math.round(yPixel * 2.83464566929134);

            console.log(xPixel, yPixel);
            console.log($(this).position().left, $(this).position().top);
            $("#" + $(this).attr("target") + "_x").html(x);
            $("#" + $(this).attr("target") + "_y").html(y);
          },
        });

      x = xPixel;
      y = yPixel;
      h = heightPixel;
      w = widthPixel;

      $(".card-signers").removeClass("d-none");
          
      $("#tb_materai tbody").append(
        `
        <tr id='gen_datam_`+ iMaterai + `' data-flagm='`+ iMaterai +`' class='gen_datam'>
          <td class='e-materai' id='gen_boxm_`+ iMaterai + `_m'>Materai ` + iMaterai + `</td>
          <td class='halaman-materai' id='gen_boxm_`+ iMaterai + `_p'>`+ pageNow + `</td>
          <td class='x-materai' id='gen_boxm_`+ iMaterai + `_x'>  ` + Math.round(x) + `</td>
          <td class='y-materai' id='gen_boxm_`+ iMaterai + `_y'>  ` + Math.round(y)  + `</td>
          <td><a id='gen_boxm_` + iMaterai + `_delete' target='` + iMaterai + `' class='btn btn-sm btn-danger' onclick='window.deleteItemMaterai(this)'><i class='fas fa-trash'></i></a></td>
        </tr>
        `
      );
      iMaterai++;

      //$("#signer_lists").scrollTop($("#signer_lists")[0].scrollHeight);
    });

    $(document).on("click", "#stempel", (e) => {
      console.log("add click");
      let posX = $("#pdfViewer").offset().left;
      let posY = $("#pdfViewer").offset().top; 
      iStempel = $("#tb_stempel tr.gen_datas").length + 1;
      console.log("posX :", posX, "posY :", posY);
      //append a new div and increment the class and turn it into jquery selector
      $(".canvas-here").append(
        '<div data-flags="' + iStempel + '" target="gen_boxs_' + iStempel + '" class="stretch-stempel gen_boxs_' + iStempel + '" page="' + pageNow + '">' + 
        '<h2 class="watermark">' + iStempel + "</h2></div>"
      );
      gen_boxs = $(".gen_boxs_" + iStempel);

      let dpi = getDPI();
      let AboxWidth = $("canvas#pdfViewer").width(),
        AboxHeight = $("canvas#pdfViewer").height(),
        ApercentWidth =
          (((e.pageX - posX) * 25.4) / dpi / ((AboxWidth * 25.4) / dpi)) * 100,
        xPixel = (ApercentWidth / 100) * (pdfWidth * 0.352778);

      (ApercentHeight =
        (((e.pageY - posY) * 25.4) / dpi / ((AboxHeight * 25.4) / dpi)) * 100),
        (yPixel = (ApercentHeight / 100) * (pdfHeight * 0.352778));
      // 25.4 = 1 inch
      // dpi = dot per inch
      (widthPercent = ((100 * 25.4) / dpi / ((AboxWidth * 25.4) / dpi)) * 100),
        (widthPixel = (widthPercent / 100) * (pdfWidth * 0.352778)),
        (heightPercent =
          ((50 * 25.4) / dpi / ((AboxHeight * 25.4) / dpi)) * 100),
        (heightPixel = (heightPercent / 100) * (pdfHeight * 0.352778));

      console.log(e.pageX - posX, e.pageY - posY);
      //add css to generated div and make it resizable & draggable

      var spanStempel = $("<span>E-Stamp</span>").css({
        "align-self": "center", // vertikal di tengah box
        "justify-self": "center", // horizontal di tengah box
        "position": "absolute", // absolute pada elemen span
        "top": "10%",
        "left": "50%", 
        "transform": "translate(-50%, -50%)",
        "font-size": "11px"
      });
      $(gen_boxs)
        .css({
          background: "rgb(0,0,0,0)",
          display: "flex",
          "justify-content": "center",
          "align-items": "center",
          width: 100,
          height: 100,
          position: "absolute",
          left: 200, //e.pageX - posX,
          top: 200, //e.pageY - posY + 70,
          "z-index": 1,
          border: "1px dashed #03738C",
          cursor: "move",
        })
        .append(spanStempel) 
        .resizable({
          containment: "#pdfViewer",
          aspectRatio: true,
          stop: function (e) {
            widthPercent =
              (($("." + $(this).attr("target")).width() * 25.4) /
                dpi /
                ((AboxWidth * 25.4) / dpi)) *
              100;
            widthPixel = (widthPercent / 100) * (pdfWidth * 0.352778);

            heightPercent =
              (($("." + $(this).attr("target")).height() * 25.4) /
                dpi /
                ((AboxHeight * 25.4) / dpi)) *
              100;
            heightPixel = (heightPercent / 100) * (pdfHeight * 0.352778);

            h = Math.round(heightPixel);
            w = Math.round(widthPixel);

            $("#" + $(this).attr("target") + "_h").html(h);
            $("#" + $(this).attr("target") + "_w").html(w);
          },
        })
        .draggable({
          containment: "#pdfViewer",
          stop: function (e) {
            ApercentWidth =
              ((($(this).offset().left - $(this).parent().offset().left) *
                25.4) /
                dpi /
                ((AboxWidth * 25.4) / dpi)) *
              100;
            xPixel = (ApercentWidth / 100) * (pdfWidth * 0.352778);

            ApercentHeight =
              ((($(this).offset().top - $(this).parent().offset().top) * 25.4) /
                dpi /
                ((AboxHeight * 25.4) / dpi)) *
              100;
            yPixel = (ApercentHeight / 100) * (pdfHeight * 0.352778);

            x = Math.round(xPixel);
            y = Math.round(yPixel);

            console.log(xPixel, yPixel);
            console.log($(this).position().left, $(this).position().top);
            $("#" + $(this).attr("target") + "_x").html(x);
            $("#" + $(this).attr("target") + "_y").html(y);
          },
        });

      x = xPixel;
      y = yPixel;
      h = heightPixel;
      w = widthPixel;

      $(".card-signers").removeClass("d-none");
      
      $("#tb_stempel tbody").append(
        `
        <tr id='gen_datas_`+ iStempel + `'data-flags='`+ iStempel +`' class='gen_datas'>
          <td>
            <input autocomplete='off' data-flag='` + iStempel + `' data-page='` + pageNow + `' style='width: 100%; border: 1px solid #e5e5e5; border-radius:40px' placeholder='Ketik email disini' class='signer-email form-control' id='gen_boxs_` + iStempel + `_email'>
          </td>
          <td class='kotak-stempel'>` + iStempel + `</td>
          <td class='halaman-stempel' id='gen_boxs_`+ iStempel + `_p'>`+ pageNow + `</td>
          <td class='x-stempel' id='gen_boxs_`+ iStempel + `_x'>  ` + Math.round(x) + `</td>
          <td class='y-stempel' id='gen_boxs_`+ iStempel + `_y'>  ` + Math.round(y)  + `</td>
          <td class='w-stempel' id='gen_boxs_`+ iStempel + `_w'>  ` + Math.round(w)  + `</td>
          <td class='h-stempel' id='gen_boxs_`+ iStempel + `_h'>  ` + Math.round(h)  + `</td>
          <td><a id='gen_boxs_` + iStempel + `_delete' target='` + iStempel + `' class='btn btn-sm btn-danger' onclick='window.deleteItemStempel(this)'><i class='fas fa-trash'></i></a></td>
        </tr>
        `
      );
      iStempel++;

      //$("#signer_lists").scrollTop($("#signer_lists")[0].scrollHeight);
    });

    $(document).on("focus", ".signer-email", function (e) {
      let flag = $(this).data("flag");
      let page = $(this).data("page");

      $(".stretch").removeClass("active");
      $(".gen_box_" + flag).addClass("active");

      if (page != pageNow) {
        pageNow = page;
        render(pageNow, false, true, flag);
      }
    });

    $(document).on("blur", ".signer-email", function (e) {
      $(".stretch").removeClass("active");
    });

    // BUTTON SUBMIT HIT
    $("#submit").on("click", function (e) {
      dataSorted = [];
      dataHolder = [];
      json_post = [];
      isInOrder = 0;

      let isEmptyEmail = false;

      if ($("#is_in_order").is(":checked")) {
        isInOrder = 1;
      }

      $(".gen_data").each(function () {
        let q = $(this).attr("data-flag");

        let email = $("#gen_box_" + q + "_email").val();
        let isHidden = $("#gen_box_" + q + "_hide").is(":checked");

        if (email == "") {
          isEmptyEmail = true;
        }

        var object = {};
        object["email"] = email.trim();

        if (!isHidden) {
          object["detail"] = [];
          var detail = {
            p: parseInt($("#gen_box_" + q + "_p").html()),
            x: parseInt($("#gen_box_" + q + "_x").html()),
            y: parseInt($("#gen_box_" + q + "_y").html()),
            w: parseInt($("#gen_box_" + q + "_w").html()),
            h: parseInt($("#gen_box_" + q + "_h").html()),
          };

          object["detail"].push(detail);
        }

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
          dataHolder[email] = object;
        }
      });

      if (!isEmptyEmail) {
        if (isInOrder) {
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: "col-md-3 btn btn-primary",
              cancelButton: "col-md-3 btn btn-secondary mr-2",
            },
            buttonsStyling: false,
          });

          let html_orders = "";
          json_post.map(function (a, b) {
            html_orders += '<li class="signer-order">' + a.email + "</li>";
          });

          swalWithBootstrapButtons
            .fire({
              title: "Penandatangan",
              html:
                "<div class='alert alert-info mb-3'><small>Tarik lalu lepaskan untuk menyesuaikan urutan</small></div><ul class='signers-order mb-3' style='padding-left: 0px;'>" +
                html_orders +
                "</ul>",
              allowOutsideClick: false,
              showCancelButton: true,
              focusConfirm: false,
              showCancelButton: true,
              cancelButtonText: "Batal",
              confirmButtonText: "Konfirmasi",
              reverseButtons: true,
              didOpen: () => {
                $(".signers-order").sortable();
              },
            })
            .then((result) => {
              if (result.isConfirmed) {
                uploadDocument();
              }
            });
          // $("#doc_signers_confirmation").modal("show");
        } else {
          let message =
            "Yakin data sudah benar, dan dokumen tidak pernah kadaluarsa?";

          if ($("#expiredDate").val() != "") {
            let expdt = $("#expiredDate").val();
            if (expdt == mm + "/" + dd + "/" + yyyy) {
              Swal.fire({
                icon: "error",
                text: "Tanggal kadaluarsa tidak boleh hari ini",
              });
            } else {
              message =
                "Yakin data sudah benar, dan dokumen akan kadaluarsa pada tanggal " +
                $("#expiredDate").val() +
                "?";
              Swal.fire({
                title: "Konfirmasi",
                text: message,
                icon: "warning",
                showCancelButton: true,
                confirmButtonText: "OK",
                cancelButtonText: "Batal",
                reverseButtons: true,
                allowOutsideClick: false,
              }).then((result) => {
                if (result.isConfirmed) {
                  uploadDocument();
                }
              });
            }
          } else {
            Swal.fire({
              title: "Konfirmasi",
              text: message,
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "OK",
              cancelButtonText: "Batal",
              reverseButtons: true,
              allowOutsideClick: false,
            }).then((result) => {
              if (result.isConfirmed) {
                uploadDocument();
              }
            });
          }
        }
      } else {
        Swal.fire({
          title: "Dokumen Gagal Diproses",
          icon: "info",
          text: "Mohon mengisi semua field",
          confirmButtonText: "Tutup",
          allowOutsideClick: false,
        });
      }
    });
  });
  // END JQUERY UI DRAGGABLE & RESIZEABLE
});

// $(".control").css({'visible':false})
// var label_nav = $("#nav");
// var page_now = 1;
// var i = 1;
// var file;
// var offset_left = $("#myPdf").offset().left - 20;
// var offset_top = $("#myPdf").offset().top - 12;
// // $(".card").draggable();

// $( function() {
//   var offParent = $("#pdfViewer").offset();
//   var offset = $( ".stretch" ).offset();
//   var pdf_height = $("#pdfViewer").height();
// });

// // UPLOAD PDF
// $("#myPdf").on("change", function(e){
//   $("#next").show().attr('disabled', false);
//   $("#prev").show().attr('disabled', true);
//   page_now = 1;
//   file = e.target.files[0];

//   countPage(file);
//   render(file, "#pdfViewer");
// });
// // END UPLOAD PDF

// // SELECT PDF PAGE
// $(".page-btn").on('click', function(argument) {
//   var action    = $(this).attr('id')
//   if ( action == 'next' ) {
//     render(file, "#pdfViewer", +page_now + +1 )
//     page_now = +page_now + +1;
//     $("#nav").html("Page <b>"+page_now+"</b> From <b>"+count_page+"</b> Page")
//   } else {
//     render(file, "#pdfViewer", page_now - 1)
//     page_now = page_now - 1;
//     $("#nav").html("Page <b>"+page_now+"</b> From <b>"+count_page+"</b> Page")
//   }

//   if (page_now == count_page) {
//     $("#next").attr('disabled', true)
//   } else {
//     $("#next").attr('disabled', false)
//   }
//   if (page_now == 1) {
//     $("#prev").attr('disabled', true)
//   } else {
//     $("#prev").attr('disabled', false)
//   }

//   for( var a = 1; a <= $(".stretch").length; a++ ){
//     if ( $(".gen_box_"+a).attr('page') != page_now ) {
//       $(".gen_box_"+a).hide()
//     } else {
//       $(".gen_box_"+a).show()
//     }
//   }
// })
// // END SELECT PDF PAGE

// // CONVERT PIXEL TO MILIMETER
//   function toMM(argument) {
//     var result = Math.floor( argument * 0.264583 );

//     return result;
//   }
// // END CONVERT PIXEL TO MILIMETER

// // JQUERY UI DRAGGABLE & RESIZEABLE
//   $("#pdfViewer").selectable({
//     containment: "#pdfViewer",
//     start : function (e) {
//       //get the mouse position on start
//       x_begin = e.pageX - offset_left;
//       y_begin = e.pageY - offset_top;
//     },
//     stop : function(e) {
//       //get the mouse position on stop
//       x_end = e.pageX - offset_left;
//       y_end = e.pageY - offset_top;

//       // Top Left -> Bottom Right
//       if ( x_end - x_begin >= 1 && y_end - y_begin >= 1) {
//         x_fix   = x_begin;
//         y_fix   = y_begin;
//         width   = x_end - x_begin;
//         height  = y_end - y_begin;
//       }

//       // Top Right -> Bottom Left
//       if( x_end - x_begin < 1 && y_end - y_begin >= 1 ) {
//         x_fix   = x_end;
//         y_fix   = y_begin;
//         width  = x_begin - x_end;
//         height = y_end - y_begin;
//       }

//       // Bottom Right -> Top Left
//       if ( y_end - y_begin < 1 && x_end - x_begin < 1 ) {
//         x_fix   = x_end;
//         y_fix   = y_end;
//         width   = x_begin - x_end;
//         height  = y_begin - y_end;
//       }

//       // Bottom Left -> Top Right
//       if ( y_end - y_begin < 1 && x_end - x_begin >= 1 ) {
//         x_fix   = x_begin;
//         y_fix   = y_end;
//         width   = x_end - x_begin;
//         height  = y_begin - y_end;
//       }

//       //append a new div and increment the class and turn it into jquery selector
//       $('.canvas-here').append('<div target="gen_box_' + i + '" class="stretch gen_box_' + i + '" page="'+page_now+'"><h2 class="watermark">'+i+'</h2></div>');
//       gen_box = $('.gen_box_' + i);
//       $(".watermark").css({
//         "position"  : "absolute",
//         "bottom"    : 0,
//         "left"      : 0,
//         "width"     : "100%",
//         "text-align": "right",
//         "margin"    : 0,
//         "padding"   : "3%"
//       })

//       //add css to generated div and make it resizable & draggable
//       $(gen_box).css({
//           'background'  : 'rgb(0,0,0,0)',
//           'width'       : width,
//           'height'      : height,
//           'position'    : 'absolute',
//           'left'        : x_fix,
//           'top'         : y_fix,
//           'z-index'     : 1,
//           'border'      : '1px dashed blue'
//       })
//       .resizable({
//         containment: "#pdfViewer",
//         stop : function(e) {
//           // Math.floor( pxl * 0.264583 ) for convert pxl -> milimeter
//           var h = toMM( $("."+$(this).attr('target')).height())
//           var w = toMM( $("."+$(this).attr('target')).width())

//           $("#"+$(this).attr('target')+"_h").html(h)
//           $("#"+$(this).attr('target')+"_w").html(w)
//         }
//       })
//       .draggable({
//         containment: "#pdfViewer",
//         stop : function(e) {
//           var x = toMM( toMM( $("."+$(this).attr('target')).offset().left ) - toMM( $("#pdfViewer").offset().left ) ) * 2
//           var y = toMM( toMM( $("."+$(this).attr('target')).offset().top ) - toMM( $("#pdfViewer").offset().top ) ) * 2

//           $("#"+$(this).attr('target')+"_x").html(x)
//           $("#"+$(this).attr('target')+"_y").html(y)
//         }
//       })

//       var x = toMM( toMM($('.gen_box_'+i).offset().left) - toMM($("#pdfViewer").offset().left) ) * 2
//       var y = toMM( toMM($('.gen_box_'+i).offset().top) - toMM($("#pdfViewer").offset().top) ) * 2

//       // Math.floor( pxl * 0.264583 ) for convert pxl -> milimeter
//       var h = toMM( $('.gen_box_'+i).height() )
//       var w = toMM( $('.gen_box_'+i).width() )

//       // set value to dialog
//       $( "#users tbody" ).append( "<tr class='gen_data'>" +
//         "<td>"+i+"</td>" +
//         "<td> <input id='gen_box_"+i+"_email' class='input-on-table'> </td>" +
//         "<td id='gen_box_"+i+"_p' >" + page_now + "</td>" +
//         "<td id='gen_box_"+i+"_x' >" + x + "</td>" +
//         "<td id='gen_box_"+i+"_y' >" + y + "</td>" +
//         "<td id='gen_box_"+i+"_h' >" + h + "</td>" +
//         "<td id='gen_box_"+i+"_w' >" + w + "</td>" +
//         "<td><a id='gen_box_" + i + "_delete' target='" + i + "' class='btn btn-sm btn-danger' onclick='window.deleteItem(this)'> delete </a></td>" +
//       "</tr>" );
//       i++;

//     }
//   })
// // END JQUERY UI DRAGGABLE & RESIZEABLE

// // BUTTON CLEAR DATA HIT
//   $("#clear-table").on('click', function(e) {
//     i = 1;
//     $(".gen_data").remove()
//     $(".stretch").remove()
//     $("#hasil_json").val("")
//   })
// // END BUTTON CLEAR DATA HIT

// BUTTON GENERATE JSON HIT
$("#generate-json").on("click", function (e) {
  // get data from table and post to some multidimensional array
  // then post to 1 object
  // then JSON.stringify(object)

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
  $("#hasil_json").val(json_data);
});
// END BUTTON GENERATE JSON HIT

// // BUTTON GENERATE JSON HIT
// $("#generate-json-materai").on("click", function (e) {
//   //console.log("test");
//   // get data from table and post to some multidimensional array
//   // then post to 1 object
//   // then JSON.stringify(object)

//   // prepare the array
//   var json_post = {};

//   // for each tr on table
//   //console.log("n :", $(".gen_datam").length);
//   for (var q = 1; q <= $(".gen_datam").length; q++) {
//     var object = {};
//     object["document_type"] = $("#document_type :selected").val();
//     object["details"] = [];
//     var details = {
//       x: parseInt($("#gen_boxm_" + q + "_x").html()),
//       y: parseInt($("#gen_boxm_" + q + "_y").html()),
//       page: parseInt($("#gen_boxm_" + q + "_p").html()),      
//     };
//     object["details"].push(details);


//     var is_new_email = true;
//     for (var z = json_post.length - 1; z >= 0; z--) {
//       if (json_post[z].email == $("#gen_box_" + q + "_email").val()) {
//         is_new_email = false;
//         json_post[z].details.push(details);
//       }
//     }

//     if (is_new_email == true) {
//       // push ke variable json_post kalau belum ada email yang di input
//       json_post.push(object);
//     }
//   }

//   var json_data = JSON.stringify(json_post);
//   $("#hasil_json_materai").val(json_data);
// });
// // END BUTTON GENERATE JSON HIT

$("#generate-json-materai").on("click", function (e) {
  // prepare the object
  // var json_post = {};

  // // for each tr on table
  // for (var q = 1; q <= $(".gen_datam").length; q++) {
  //   // var email = $("#gen_box_" + q + "_email").val();
  //   var details = {
  //     x: parseInt($("#gen_boxm_" + q + "_x").html()),
  //     y: parseInt($("#gen_boxm_" + q + "_y").html()),
  //     page: parseInt($("#gen_boxm_" + q + "_p").html()),      
  //   };

  //   // create a new object for each email
  //   // if (!json_post[email]) {
  //     json_post = {
  //       document_type: $("#document_type :selected").val(),
  //       details: [details]
  //     };
      
  //   // }
  //   // add details to existing object for the same email
  //   // else {
  //   //   json_post[email].details.push(details);
  //   // }
  // }

  var details_arr = []; //  array kosong untuk menyimpan objek "details"

  for (var q = 1; q <= $(".gen_datam").length; q++) {
    var details = {
      x: parseInt($("#gen_boxm_" + q + "_x").html()),
      y: parseInt($("#gen_boxm_" + q + "_y").html()),
      page: parseInt($("#gen_boxm_" + q + "_p").html()),
    };
    details_arr.push(details); // tambahkan objek "details" ke dalam array
  }

  var json_post = {
    document_type: $("#document_type :selected").val(),
    details: details_arr // tambahkan array "details_arr" ke dalam objek "json_post"
  };

    var json_data = JSON.stringify(json_post);
    $("#hasil_json_materai").val(json_data);
  });


// BUTTON GENERATE JSON HIT
$("#generate-json-stempel").on("click", function (e) {
  // get data from table and post to some multidimensional array
  // then post to 1 object
  // then JSON.stringify(object)

  // prepare the array
  var json_post = [];

  // for each tr on table
  for (var q = 1; q <= $(".gen_datas").length; q++) {
    var object = {};
    object["email"] = $("#gen_boxs_" + q + "_email").val();
    object["detail"] = [];
    var detail = {
      p: parseInt($("#gen_boxs_" + q + "_p").html()),
      x: parseInt($("#gen_boxs_" + q + "_x").html()),
      y: parseInt($("#gen_boxs_" + q + "_y").html()),
      w: parseInt($("#gen_boxs_" + q + "_w").html()),
      h: parseInt($("#gen_boxs_" + q + "_h").html()),
    };
    object["detail"].push(detail);

    var is_new_email = true;
    for (var z = json_post.length - 1; z >= 0; z--) {
      if (json_post[z].email == $("#gen_boxs_" + q + "_email").val()) {
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
  $("#hasil_json_stempel").val(json_data);
});
// END BUTTON GENERATE JSON HIT


$("#generate-send").on("click", function (e) {
  if ($("#users tr.gen_data").length > 0 ) {
    $('#generate-json').trigger('click');
  } 
  if($("#tb_materai tr.gen_datam").length > 0 ) {
    $('#generate-json-materai').trigger('click');
  } 
  if($("#tb_stempel tr.gen_datas").length > 0 ) {
    $('#generate-json-stempel').trigger('click');
  }
});



// // buton copy json result
  $("#copy").on('click', function(e){
    var copy_text = $("#hasil_json");
    /* Select the text field */
    copy_text.select();
    /* Copy the text inside the text field */
    document.execCommand("copy");
    /* Alert the copied text */
    alert("Copied the text: " + copy_text.val());
  })
// end button copy json

function countPage( file ) {
  var reader = new FileReader();

  reader.onload = function(a) {
    count_page = reader.result.match(/\/Type[\s]*\/Page[^s]/g).length;
    $("#nav").html("Page <b>1</b> From <b>"+count_page+"</b> Page");
    if ( count_page == 1 ) {
      $("#next").attr("disabled", true);
    }
  }
  reader.readAsBinaryString(file);
}
