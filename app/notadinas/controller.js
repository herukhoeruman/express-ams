const path = require("path");
const fs = require("fs");
const config = require("../../config");
const axios = require("axios");
const nodemailer = require("nodemailer");
const FormData = require("form-data");
const CryptoJS = require("crypto-js");
const { v4: uuidv4 } = require("uuid");
const trxId = uuidv4();
const QRCode = require("qrcode");

const NotaDinas = require("../../app/notadinas/model");
const DisposisiMaster = require("../../app/notadinas/modelDisposisi");
const NotaDinasSent = require("../../app/notadinas/modelSent");
const NotaDinasInbox = require("../../app/notadinas/modelInbox");
const Users = require("../../app/users/model");
const Response = require("../../app/notadinas/modelResponse");
const Request = require("../../app/notadinas/modelRequest");
const Callback = require("../../app/callback/model");
const Klasifikasi = require("../../app/notadinas/modelKlasifikasi");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "heru@gsp.co.id",
    pass: "kmxhzrrripuntgte",
  },
});

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = { message: alertMessage, status: alertStatus };

      const username = req.session.user.username;
      const jabatan = req.session.user.jabatan.sebutanJabatan;
      // const notaDinas = await NotaDinas.find({
      //   $or: [{ kepada: jabatan }, { "disposisi.penerima": jabatan }],
      //   flag: 2,
      // });

      // const notaDinas = await Notif.find().populate("notaDinasId");
      const notaDinas = await NotaDinasInbox.find({
        penerima: jabatan,
      }).populate("notaDinasId");

      // console.log(notaDinas);
      // return;

      const disposisiMaster = await DisposisiMaster.find();
      const users = await Users.find();

      res.render("notadinas/index", {
        // count,
        notaDinas,
        alert,
        disposisiMaster,
        users,
        title: "Nota Dinas",
        subtitle: "Nota Dinas Masuk",
        namaLengkap: req.session.user.namaLengkap,
        username,
        jabatan: req.session.user.jabatan,
        role: req.session.user.role,
      });
    } catch (err) {
      console.log(err);
    }
  },

  detail: async (req, res) => {
    try {
      const { id } = req.params;
      const jabatan = req.session.user.jabatan.sebutanJabatan;
      const notaDinas = await NotaDinas.findOne({ _id: id });
      const notaDinasInbox = await NotaDinasInbox.findOne({
        notaDinasId: id,
        penerima: jabatan,
      });

      // return log(notaDinasInbox);

      // if (notaDinas.kepada === jabatan) {
      await NotaDinasInbox.findOneAndUpdate(
        { penerima: jabatan, notaDinasId: id },
        { $set: { readStatus: true } }
      );
      // }

      res.render("notadinas/detail", {
        notaDinas,
        title: "Nota Dinas",
        subtitle: "Detail Nota Dinas",
        namaLengkap: req.session.user.namaLengkap,
        username: req.session.user.username,
        jabatan: req.session.user.jabatan,
        role: req.session.user.role,
      });
    } catch (err) {
      console.log(err);
      res.redirect("/notadinas");
    }
  },

  terkirim: async (req, res) => {
    try {
      const username = req.session.user.username;
      const jabatan = req.session.user.jabatan.sebutanJabatan;
      console.log(jabatan);

      const notaDinasTerkirim = await NotaDinasSent.find({
        pengirim: jabatan,
      }).populate("notaDinasId");

      res.render("notadinas/terkirim/index", {
        notaDinasTerkirim,
        title: "Nota Dinas",
        subtitle: "Nota Dinas Terkirim",
        namaLengkap: req.session.user.namaLengkap,
        username,
        jabatan: req.session.user.jabatan,
        role: req.session.user.role,
      });
    } catch (err) {
      console.log(err);
    }
  },

  viewDraft: async (req, res) => {
    try {
      const username = req.session.user.username;
      const jabatan = req.session.user.jabatan.sebutanJabatan;

      const notaDinas = await NotaDinas.find({ flag: 0 }).sort({
        createdAt: -1,
      });

      res.render("notadinas/konsep/index", {
        notaDinas,
        title: "Nota Dinas",
        subtitle: "Draft Nota Dinas",
        namaLengkap: req.session.user.namaLengkap,
        username,
        jabatan: req.session.user.jabatan,
        role: req.session.user.role,
      });
    } catch (error) {
      console.log(error);
    }
  },

  viewEditDraft: async (req, res) => {
    try {
      const { id } = req.params;
      const notaDinas = await NotaDinas.findOne({ _id: id });

      const users = await Users.find();
      const klasifikasi = await Klasifikasi.find();

      res.render("notadinas/konsep/edit", {
        notaDinas,
        users,
        klasifikasi,
        title: "Nota Dinas",
        subtitle: "Draft Nota Dinas",
        namaLengkap: req.session.user.namaLengkap,
        username: req.session.user.username,
        jabatan: req.session.user.jabatan,
        role: req.session.user.role,
      });
    } catch (err) {
      console.log(err);
      res.redirect("/notadinas");
    }
  },

  actionSimpanDraft: async (req, res) => {
    try {
      const {
        noNotaDinas,
        noAgenda,
        tanggal,
        tahun,
        dari,
        kepada,
        pemeriksa,
        perihal,
        jumlahLampiran,
        jenisLampiran,
        kodeKlasifikasi,
        sifatPenyampaian,
        sifatPengamanan,
        isiSurat,
        tembusan,
        keterangan,
        email,
        divisi,
      } = req.body;
      const pengirim = req.session.user.jabatan.sebutanJabatan;
      const setDate = new Date(tanggal);
      setDate.setUTCHours(0);
      setDate.setUTCMinutes(0);
      setDate.setUTCSeconds(0);
      setDate.setUTCMilliseconds(0);

      const nomor = noNotaDinas.replace(/\//g, "_");

      const document = path.resolve(
        config.rootPath,
        `public/document/nota-dinas/NOTA_DINAS_${nomor}.pdf`
      );
      const filename = document.split("\\").pop();

      let attachmentFileName = null;
      if (req.file) {
        const filePath = req.file.path;
        attachmentFileName = req.file.originalname;
        const targetPath = path.resolve(
          config.rootPath,
          `public/upload/attachment/${attachmentFileName}`
        );
        console.log(filePath);
        console.log(targetPath);
        console.log(attachmentFileName);

        const src = fs.createReadStream(filePath);
        const dest = fs.createWriteStream(targetPath);
        src.pipe(dest);
      }

      const x = noNotaDinas.split("/");
      let setNoAgendaSisipan;
      if (x[0].length === 3) {
        setNoAgendaSisipan = 0;
      } else {
        const y = x[0].split("-");
        setNoAgendaSisipan = y[1];
      }

      const newNotaDinas = new NotaDinas({
        noNotaDinas,
        noAgenda,
        noAgendaSisipan: setNoAgendaSisipan,
        tanggal,
        date: setDate,
        tahun,
        dari,
        kepada,
        pemeriksa,
        pengirim,
        perihal,
        jumlahLampiran,
        jenisLampiran,
        kodeKlasifikasi,
        sifatPenyampaian,
        sifatPengamanan,
        isiSurat,
        tembusan,
        keterangan,
        attachment: attachmentFileName,
        email,
        divisi,
        document: filename,
        flag: 0,
      });
      const savedNotaDinas = await newNotaDinas.save();
      res.status(200).json({ savedNotaDinas });
    } catch (err) {
      console.log(err);
      res.status(400).json({ err });
    }
  },

  actionEditDraft: async (req, res) => {
    try {
      const { id } = req.params;

      await NotaDinas.findOneAndUpdate({ _id: id }, { $set: { flag: 1 } });
      res.status(200).json({ message: "Nota Dinas berhasil terkirim" });
    } catch (error) {
      console.log(error);
    }
  },

  persetujuan: async (req, res) => {
    try {
      const username = req.session.user.username;
      const jabatan = req.session.user.jabatan.sebutanJabatan;
      const notaDinas = await NotaDinas.find({ pemeriksa: jabatan }).sort({
        createdAt: -1,
      });

      const notaDinasApproved = await NotaDinas.find({ flag: 2 });

      // // for of  async
      // for (const data of notaDinasApproved) {
      //   const id = data.dataResponse.id;
      //   const fileName = data.document;
      //   const tahun = data.tahun;
      //   const signed = await Callback.findOne({ documentId: id });

      //   // const outputFilePath = path.resolve(
      //   //   config.rootPath,
      //   //   `public/upload/signed/${fileName}`
      //   // );
      //   const folderPath = path.resolve(
      //     config.rootPath,
      //     `public/document/nota-dinas/${tahun}/signed/`
      //   );
      //   const outputFilePath = path.resolve(folderPath, `${fileName}`);

      //   fs.mkdir(folderPath, { recursive: true }, (err) => {
      //     if (err) {
      //       console.log(err);
      //     } else {
      //       console.log("Directory created successfully!");
      //     }
      //   });

      //   if (fs.existsSync(outputFilePath)) {
      //     console.log("File already exists.");
      //   } else {
      //     try {
      //       const response = await axios({
      //         url: signed.downloadUrl,
      //         method: "GET",
      //         responseType: "stream",
      //       });

      //       response.data.pipe(fs.createWriteStream(outputFilePath));

      //       await new Promise((resolve, reject) => {
      //         response.data.on("end", () => {
      //           console.log("File downloaded successfully.");
      //           resolve();
      //         });

      //         response.data.on("error", (err) => {
      //           console.error("Error downloading file:", err);
      //           reject(err);
      //         });
      //       });
      //     } catch (error) {
      //       console.error("Error downloading file:", error);
      //     }
      //   }
      // }
      res.render("notadinas/persetujuan/index", {
        notaDinas,
        title: "Nota Dinas",
        subtitle: "Persetujuan Nota Dinas",
        namaLengkap: req.session.user.namaLengkap,
        username,
        jabatan: req.session.user.jabatan,
        role: req.session.user.role,
      });
    } catch (err) {
      console.log(err);
    }
  },

  viewPersetujuan: async (req, res) => {
    try {
      const { id } = req.params;
      const notaDinas = await NotaDinas.findOne({ _id: id });

      const lastNoAgenda = await NotaDinas.findOne()
        .sort({ noAgenda: -1 })
        .limit(1);
      const disposisiMaster = await DisposisiMaster.find();
      const users = await Users.find();
      const historyDisposisi = await NotaDinasInbox.find({
        notaDinasKode: id,
      });
      const klasifikasi = await Klasifikasi.find();

      res.render("notadinas/persetujuan/edit", {
        notaDinas,
        lastNoAgenda,
        disposisiMaster,
        users,
        historyDisposisi,
        klasifikasi,
        title: "Nota Dinas",
        subtitle: "Persetujuan Nota Dinas",
        namaLengkap: req.session.user.namaLengkap,
        username: req.session.user.username,
        jabatan: req.session.user.jabatan,
        role: req.session.user.role,
      });
    } catch (err) {
      console.log(err);
      res.redirect("/notadinas");
    }
  },

  updateNotaDinas: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        noNotaDinas,
        noAgenda,
        tanggal,
        tahun,
        dari,
        kepada,
        pemeriksa,
        pengirim,
        perihal,
        jumlahLampiran,
        jenisLampiran,
        kodeKlasifikasi,
        sifat,
        isiSurat,
        tembusan,
        // keterangan,
        email,
        divisi,
        flag,
      } = req.body;

      if (req.file) {
        const filePath = req.file.path;
        const attachmentFileName = req.file.originalname;
        const targetPath = path.resolve(
          config.rootPath,
          `public/upload/attachment/${attachmentFileName}`
        );
        console.log(filePath);
        console.log(targetPath);
        console.log(attachmentFileName);

        const src = fs.createReadStream(filePath);
        const dest = fs.createWriteStream(targetPath);
        src.pipe(dest);

        src.on("end", async () => {
          try {
            const updateNotaDinas = await NotaDinas.findOneAndUpdate(
              { _id: id },
              {
                noNotaDinas,
                noAgenda,
                tanggal,
                tahun,
                dari,
                kepada,
                pemeriksa,
                pengirim,
                perihal,
                jumlahLampiran,
                jenisLampiran,
                kodeKlasifikasi,
                sifat,
                isiSurat,
                tembusan,
                // keterangan,
                email,
                divisi,
                attachment: attachmentFileName,
                flag,
              }
            );
            res.status(200).json({ updateNotaDinas });
          } catch (err) {
            console.log(err);
          }
        });
      } else {
        try {
          const updateNotaDinas = await NotaDinas.findOneAndUpdate(
            { _id: id },
            {
              noNotaDinas,
              noAgenda,
              tanggal,
              tahun,
              dari,
              kepada,
              pemeriksa,
              pengirim,
              perihal,
              jumlahLampiran,
              jenisLampiran,
              kodeKlasifikasi,
              sifat,
              isiSurat,
              tembusan,
              // keterangan,
              email,
              divisi,
              flag,
            }
          );
          res.status(200).json({ updateNotaDinas });
        } catch (err) {
          console.log(err);
        }
      }

      // res.redirect("");
    } catch (err) {
      console.log(err);
      res.redirect("/notadinas");
    }
  },

  viewCreate: async (req, res) => {
    try {
      const lastNoAgenda = await NotaDinas.findOne()
        .sort({ noAgenda: -1 })
        .limit(1);
      const disposisiMaster = await DisposisiMaster.find();
      const users = await Users.find();

      res.render("notadinas/create", {
        lastNoAgenda,
        disposisiMaster,
        users,
        title: "Buat Nota Dinas",
        username: req.session.user.username,
        jabatan: req.session.user.jabatan,
      });
    } catch (err) {
      console.log(err);
      res.redirect("/notadinas");
    }
  },

  actionCreate: async (req, res) => {
    try {
      const {
        noAgenda,
        noNotaDinas,
        tahunAgenda,
        tglNotaDinas,
        dari,
        kepada,
        perihal,
        lampiran,
        kodeMasalah,
        sifat,
        keterangan,
      } = req.body;

      const notaDinas = await NotaDinas({
        noAgenda,
        noNotaDinas,
        tahunAgenda,
        tglNotaDinas,
        dari,
        kepada,
        perihal,
        lampiran,
        kodeMasalah,
        sifat,
        keterangan,
      });
      await notaDinas.save();

      res.status(200).json(notaDinas);
    } catch (err) {
      console.log(err);
    }
  },

  viewEdit: async (req, res) => {
    try {
      const { id } = req.params;
      const notaDinas = await NotaDinas.findOne({ _id: id });

      const lastNoAgenda = await NotaDinas.findOne()
        .sort({ noAgenda: -1 })
        .limit(1);
      const disposisiMaster = await DisposisiMaster.find();
      const users = await Users.find();
      const historyDisposisi = await NotaDinasInbox.find({
        notaDinasKode: id,
      });

      res.render("notadinas/edit", {
        notaDinas,
        lastNoAgenda,
        disposisiMaster,
        users,
        historyDisposisi,
        title: "Edit Nota Dinas",
        subtitle: "",
        username: req.session.user.username,
        jabatan: req.session.user.jabatan,
      });
    } catch (err) {
      console.log(err);
      res.redirect("/notadinas");
    }
  },

  actionEdit: async (req, res) => {
    try {
      const { id } = req.params;
      const {
        noNotaDinas,
        tahunAgenda,
        tglNotaDinas,
        dari,
        kepada,
        perihal,
        lampiran,
        kodeMasalah,
        sifat,
        keterangan,
        userUpdate,
      } = req.body;

      if (req.file) {
        const tmp_path = req.file.path;
        const originalExt =
          req.file.originalname.split(".")[
            req.file.originalname.split(".").length - 1
          ];
        // const filename = req.file.filename + "." + originalExt;
        const filename = id + "_" + req.file.originalname;
        const target_path = path.resolve(
          config.rootPath,
          `public/upload/${filename}`
        );

        const src = fs.createReadStream(tmp_path);
        const dest = fs.createWriteStream(target_path);
        src.pipe(dest);

        src.on("end", async () => {
          try {
            const updateNotaDinas = await NotaDinas.findOneAndUpdate(
              { _id: id },
              {
                noNotaDinas,
                tahunAgenda,
                tglNotaDinas,
                dari,
                kepada,
                perihal,
                lampiran,
                kodeMasalah,
                sifat,
                keterangan,
                userUpdate,
                files: filename,
              }
            );
            res.status(200).json(updateNotaDinas);
          } catch (err) {
            console.log(err);
          }
        });
      } else {
        const updateNotaDinas = await NotaDinas.findOneAndUpdate(
          { _id: id },
          {
            noNotaDinas,
            tahunAgenda,
            tglNotaDinas,
            dari,
            kepada,
            perihal,
            lampiran,
            kodeMasalah,
            sifat,
            keterangan,
            userUpdate,
          }
        );
        res.status(200).json(updateNotaDinas);
      }
    } catch (err) {
      console.log(err);
    }
  },

  insertNotaDinasSent: async (req, res) => {
    try {
      const { id } = req.params;
      const { tindakLanjut, disposisi, penerima } = req.body;
      const pengirim = req.session.user.jabatan.sebutanJabatan;

      const user = await Users.findOne({
        "jabatan.sebutanJabatan": penerima,
      });

      const newDate = new Date();
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      const tanggal = newDate.toLocaleDateString("id-ID", options);
      const disposisiData = {
        pengirim,
        penerima,
        disposisi,
        tindakLanjut,
        tanggal,
      };

      await NotaDinas.findOneAndUpdate(
        { _id: id },
        { $push: { disposisi: disposisiData } },
        { new: true }
      );

      const newSent = new NotaDinasSent({
        pengirim,
        penerima,
        disposisi,
        tindakLanjut,
        tanggal,
        notaDinasId: id,
      });
      await newSent.save();

      const newInbox = new NotaDinasInbox({
        pengirim,
        penerima,
        disposisi,
        tindakLanjut,
        readStatus: false,
        notaDinasId: id,
      });
      await newInbox.save();

      // notif email
      try {
        const emailTemplatePath = path.resolve(
          config.rootPath,
          `public/html/nota-dinas-disposisi.html`
        );
        const emailTemplate = await fs.promises.readFile(
          emailTemplatePath,
          "utf-8"
        );

        const html = emailTemplate
          .replace("{{pengirim}}", pengirim)
          .replace("{{penerima}}", penerima)
          .replace("{{tanggal}}", tanggal)
          .replace("{{tindakLanjut}}", tindakLanjut)
          .replace("{{disposisi}}", disposisi)
          .replace("{{id}}", id);

        const info = await transporter.sendMail({
          from: "heru@gsp.co.id",
          to: user.email,
          subject: "Nota Dinas Masuk",
          text: "Hello world?",
          html: html,
        });

        console.log("[EMAIL_SENT] : %s", info.messageId);
      } catch (error) {
        console.log("[EMAIL_ERROR]", error);
      }
      res.redirect("/notadinas");
    } catch (err) {
      console.log(err);
    }
  },

  insertNotaDinasInbox: async (req, res) => {
    try {
      const username = req.session.user.username;
      const { pengirim, notaDinasKode, sentKode, tindakLanjut, tanggal } =
        req.body;
      const jsondisposisi = req.body.disposisi;
      const jsonpenerima = req.body.penerima;
      const disposisi = JSON.parse(jsondisposisi);
      const penerima = JSON.parse(jsonpenerima);

      const notaDinasInbox = await NotaDinasInbox({
        username: username,
        pengirim: username,
        penerima: penerima,
        notaDinasKode: notaDinasKode,
        sentKode: sentKode,
        disposisi: disposisi,
        tindakLanjut: tindakLanjut,
        tanggal: tanggal,
      });
      await notaDinasInbox.save();
      res.status(200).json(notaDinasInbox);
    } catch (err) {
      console.log(err);
    }
  },

  konsepNotaDinas: async (req, res) => {
    try {
      const divisi = req.session.user.jabatan.namaUnit;
      const users = await Users.find();
      const klasifikasi = await Klasifikasi.find();
      const tahun = new Date().getFullYear();
      const lastNoAgenda = await NotaDinas.findOne({ divisi: divisi }).sort({
        noAgenda: -1,
      });

      let noAgenda;
      if (lastNoAgenda !== null) {
        if (lastNoAgenda.tahun !== tahun) {
          noAgenda = 1;
        } else {
          noAgenda = lastNoAgenda.noAgenda + 1;
        }
      } else {
        noAgenda = 1;
      }

      res.render("notadinas/konsep", {
        noAgenda,
        users,
        klasifikasi,
        title: "Konsep Nota Dinas",
        subtitle: "Konsep Nota Dinas",
        namaLengkap: req.session.user.namaLengkap,
        username: req.session.user.username,
        jabatan: req.session.user.jabatan,
        role: req.session.user.role,
        divisi,
      });
    } catch (err) {
      console.log(err);
    }
  },

  prosesKonsep: async (req, res) => {
    try {
      const { tanggal } = req.body;
      const setDate = new Date(tanggal);
      const nowDate = new Date();
      const tahun = new Date().getFullYear();
      nowDate.setUTCHours(0);
      nowDate.setUTCMinutes(0);
      nowDate.setUTCSeconds(0);
      nowDate.setUTCMilliseconds(0);

      let noAgenda;

      const lastNoAgenda = await NotaDinas.findOne({
        divisi: req.session.user.jabatan.namaUnit,
      }).sort({
        noAgenda: -1,
      });

      if (lastNoAgenda !== null) {
        if (lastNoAgenda.tahun !== tahun) {
          const noReset = lastNoAgenda.noAgenda + 1;
          noAgenda = noReset.toString().padStart(3, "0");
          res.status(200).json({ noAgenda });
        } else {
          if (setDate < nowDate) {
            const notaDinas = await NotaDinas.findOne({
              divisi: req.session.user.jabatan.namaUnit,
              date: { $lte: setDate },
            }).sort({
              noAgenda: -1,
              noAgendaSisipan: -1,

              // date: -1,
              // createdAt: -1,
            });

            if (!notaDinas) {
              return res.status(200).json({
                status: "error",
                message: "Tidak bisa melakukan backdate",
              });
            }

            console.log("[NO_AGENDA_SISIPAN]", notaDinas.noAgendaSisipan);
            console.log("[NO_AGENDA]", notaDinas.noAgenda);

            if (notaDinas.noAgendaSisipan > 0) {
              const noSisipan = notaDinas.noAgendaSisipan + 1;
              if (noSisipan >= 10) {
                console.log("[sisipan > 10]");
                const sisipan = notaDinas.noAgenda + "-" + noSisipan;
                noAgenda = sisipan.toString().padStart(6, "0");
              } else {
                console.log("[sisipan < 10]");

                const sisipan = notaDinas.noAgenda + "-0" + noSisipan;
                noAgenda = sisipan.toString().padStart(6, "0");
              }
            } else {
              const sisipan = notaDinas.noAgenda + "-01";
              noAgenda = sisipan.toString().padStart(6, "0");
            }

            res.status(200).json({ noAgenda });
          } else {
            const noBaru = lastNoAgenda.noAgenda + 1;
            noAgenda = noBaru.toString().padStart(3, "0");
            res.status(200).json({ noAgenda });
            console.log(noAgenda);
          }
        }
      } else {
        const noAwal = 1;
        noAgenda = noAwal.toString().padStart(3, "0");
        res.status(200).json({ noAgenda });
      }
    } catch (error) {
      console.log(error);
    }
  },

  savePdf: async (req, res) => {
    try {
      const pdfBase64 = req.body.document; //base64
      const nomor = req.body.nomor;
      const tahun = req.body.tahun;
      const nomorNotaDinas = nomor.replace(/\//g, "_");

      const folderPath = path.resolve(
        config.rootPath,
        `public/document/nota-dinas/${tahun}`
      );
      const outputPath = path.resolve(
        folderPath,
        `NOTA_DINAS_${nomorNotaDinas}.pdf`
      );
      // const outputPath = path.resolve(config.rootPath, `public/upload/NOTA_DINAS_${nomorModifikasi}.pdf`);

      fs.mkdir(folderPath, { recursive: true }, (err) => {
        if (err) {
          console.log(err);
        } else {
          const dataPdf = pdfBase64.replace(
            /^data:application\/pdf;base64,/,
            ""
          );
          const buffer = Buffer.from(dataPdf, "base64");

          fs.writeFile(outputPath, buffer, (err) => {
            if (err) {
              console.error(err);
              res
                .status(500)
                .json({ status: "error", message: "file failed to save" });
            } else {
              // console.log("File PDF berhasil disimpan:", outputPath);
              res
                .status(200)
                .json({ status: "ok", message: "file saved successfully" });
            }
          });
        }
      });
    } catch (error) {
      console.log(error);
    }
  },

  kirim: async (req, res) => {
    try {
      const {
        noNotaDinas,
        noAgenda,
        tanggal,
        tahun,
        dari,
        kepada,
        pemeriksa,
        // pengirim,
        perihal,
        jumlahLampiran,
        jenisLampiran,
        kodeKlasifikasi,
        sifatPenyampaian,
        sifatPengamanan,
        isiSurat,
        tembusan,
        keterangan,
        email,
        divisi,
      } = req.body;
      const pengirim = req.session.user.jabatan.sebutanJabatan;
      const setDate = new Date(tanggal);
      setDate.setUTCHours(0);
      setDate.setUTCMinutes(0);
      setDate.setUTCSeconds(0);
      setDate.setUTCMilliseconds(0);
      const nomor = noNotaDinas.replace(/\//g, "_");

      console.log("[TEMBUSAN]", tembusan);
      console.log("[TEMBUSAN]", typeof tembusan);
      // return;

      const document = path.resolve(
        config.rootPath,
        `public/document/nota-dinas/NOTA_DINAS_${nomor}.pdf`
      );
      const filename = document.split("\\").pop();

      //!
      let attachmentFileName = null;
      if (req.file) {
        const filePath = req.file.path;
        attachmentFileName = req.file.originalname;
        const targetPath = path.resolve(
          config.rootPath,
          `public/upload/attachment/${attachmentFileName}`
        );
        console.log(filePath);
        console.log(targetPath);
        console.log(attachmentFileName);

        const src = fs.createReadStream(filePath);
        const dest = fs.createWriteStream(targetPath);
        src.pipe(dest);
      }

      const x = noNotaDinas.split("/");
      let setNoAgendaSisipan;
      if (x[0].length === 3) {
        setNoAgendaSisipan = 0;
      } else {
        const y = x[0].split("-");
        setNoAgendaSisipan = y[1];
      }

      console.log(setNoAgendaSisipan);

      // return;

      const newNotaDinas = new NotaDinas({
        noNotaDinas,
        noAgenda,
        noAgendaSisipan: setNoAgendaSisipan,
        tanggal,
        date: setDate,
        tahun,
        dari,
        kepada,
        pemeriksa,
        pengirim,
        perihal,
        jumlahLampiran,
        jenisLampiran,
        kodeKlasifikasi,
        sifatPenyampaian,
        sifatPengamanan,
        isiSurat,
        tembusan,
        keterangan,
        attachment: attachmentFileName,
        email,
        divisi,
        document: filename,
        flag: 1,
      });
      const savedNotaDinas = await newNotaDinas.save();
      res.status(200).json({ savedNotaDinas });

      //   src.on("end", async () => {
      //     try {
      //       const newNotaDinas = new NotaDinas({
      //         noNotaDinas,
      //         noAgenda,
      //         tanggal,
      //         tahun,
      //         dari,
      //         kepada,
      //         pemeriksa,
      //         pengirim,
      //         perihal,
      //         jumlahLampiran,
      //         jenisLampiran,
      //         kodeKlasifikasi,
      //         sifat,
      //         isiSurat,
      //         tembusan,
      //         keterangan,
      //         attachment: attachmentFileName,
      //         email,
      //         divisi,
      //         document: filename,
      //         flag: 1,
      //       });
      //       const savedNotaDinas = await newNotaDinas.save();
      //       res.status(200).json({ savedNotaDinas });
      //     } catch (err) {
      //       console.log(err);
      //     }
      //   });
      // } else {
      //   try {
      //     const newNotaDinas = new NotaDinas({
      //       noNotaDinas,
      //       noAgenda,
      //       tanggal,
      //       tahun,
      //       dari,
      //       kepada,
      //       pemeriksa,
      //       pengirim,
      //       perihal,
      //       jumlahLampiran,
      //       jenisLampiran,
      //       kodeKlasifikasi,
      //       sifat,
      //       isiSurat,
      //       tembusan,
      //       keterangan,
      //       email,
      //       divisi,
      //       document: filename,
      //       flag: 1,
      //     });
      //     const savedNotaDinas = await newNotaDinas.save();
      //     res.status(200).json({ savedNotaDinas });
      //   } catch (err) {
      //     console.log(err);
      //   }
      // }
    } catch (err) {
      console.log(err);
      res.status(400).json({ err });
    }
  },

  prosesPersetujuan: async (req, res) => {
    try {
      const { nomor, dari, nama } = req.body;

      //nama
      const text = `
      Nomor : ${nomor}
      Nama : ${req.session.user.namaLengkap}
      Jabatan : ${dari}
      `;

      QRCode.toDataURL(text, (err, url) => {
        res.status(200).json({ status: "ok", url: url });
      });
    } catch (error) {
      console.log(error);
    }
  },

  actionPersetujuan: async (req, res) => {
    try {
      const { id } = req.params;
      const { flag, url } = req.body;

      const notaDinas = await NotaDinas.findById(id);
      const user = await Users.findOne({
        "jabatan.sebutanJabatan": notaDinas.kepada,
      });

      if (flag == "2") {
        const tembusanArray = notaDinas.tembusan; // Ambil array tembusan dari notaDinas
        const savePromises = []; // Untuk menyimpan promise-promise penyimpanan

        for (const tembusan of tembusanArray) {
          const newSent = new NotaDinasSent({
            pengirim: notaDinas.dari,
            penerima: tembusan,
            readStatus: false,
            notaDinasId: id,
          });

          const sentPromise = newSent.save();
          savePromises.push(sentPromise); // Tambahkan promise ke dalam array

          const newInbox = new NotaDinasInbox({
            pengirim: notaDinas.dari,
            penerima: tembusan,
            readStatus: false,
            notaDinasId: id,
          });

          const inboxPromise = newInbox.save();
          savePromises.push(inboxPromise); // Tambahkan promise ke dalam array
        }

        await Promise.all(savePromises); // Tunggu hingga semua promise selesai
        // return;

        const folderPath = path.resolve(
          config.rootPath,
          `public/document/nota-dinas/${notaDinas.tahun}/signed/`
        );
        const outputPath = path.resolve(folderPath, `${notaDinas.document}`);
        fs.mkdir(folderPath, { recursive: true }, (err) => {
          if (err) {
            console.log("[MKDIR_ERROR]", err);
          } else {
            const dataPdf = url.replace(/^data:application\/pdf;base64,/, "");

            const buffer = Buffer.from(dataPdf, "base64");
            fs.writeFile(outputPath, buffer, (err) => {
              if (err) {
                return console.log("[SAVE_PDF_ERROR]", err);
              } else {
                return console.log("[SAVE_PDF_SUCCESS]", outputPath);
              }
            });
          }
        });

        const updateNotaDinas = await NotaDinas.findOneAndUpdate(
          { _id: id },
          { $set: { flag } }
        );

        const newSent = new NotaDinasSent({
          pengirim: notaDinas.dari,
          penerima: notaDinas.kepada,
          readStatus: false,
          notaDinasId: id,
        });
        await newSent.save();

        const newInbox = new NotaDinasInbox({
          pengirim: notaDinas.dari,
          penerima: notaDinas.kepada,
          readStatus: false,
          notaDinasId: id,
        });
        await newInbox.save();

        try {
          const emailTemplatePath = path.resolve(
            config.rootPath,
            `public/html/nota-dinas-masuk.html`
          );

          const emailTemplate = await fs.promises.readFile(
            emailTemplatePath,
            "utf-8"
          );

          const html = emailTemplate
            .replace("{{nomor}}", notaDinas.noNotaDinas)
            .replace("{{kepada}}", notaDinas.kepada)
            .replace("{{dari}}", notaDinas.dari)
            .replace("{{tanggal}}", notaDinas.tanggal)
            .replace("{{sifat}}", notaDinas.sifat)
            .replace("{{lampiran}}", notaDinas.jumlahLampiran)
            .replace("{{hal}}", notaDinas.perihal)
            .replace("{{isiSurat}}", notaDinas.isiSurat)
            .replace("{{id}}", id);

          const info = await transporter.sendMail({
            from: "heru@gsp.co.id",
            to: user.email,
            subject: "Nota Dinas Masuk",
            text: "Hello world?",
            html: html,
          });

          console.log("[EMAIL_SENT] : %s", info.messageId);
        } catch (error) {
          console.error("[EMAIL_ERROR]:", error);
        }

        res.status(200).json({
          status: "ok",
          message: "Nota Dinas telah disetujui",
          data: updateNotaDinas,
        });
      } else {
        const updateNotaDinas = await NotaDinas.findOneAndUpdate(
          { _id: id },
          { $set: { flag } }
        );
        res.status(200).json({
          status: "ok",
          message: "Nota Dinas telah dibatalkan",
          data: updateNotaDinas,
        });
      }
    } catch (error) {
      console.log(error);
    }
  },

  actionPersetujuanUntukSuratKeluar: async (req, res) => {
    try {
      const { id } = req.params;
      const { flag } = req.body;
      const notaDinas = await NotaDinas.findById(id);
      const user = await Users.findOne({
        "jabatan.sebutanJabatan": notaDinas.kepada,
      });

      const email = req.session.user.email;
      // const email = "heru@gsp.co.id";

      const signature = `[{"email":"${email}","detail":[{"p":1,"x":130,"y":220,"w":50,"h":24}]}]`; //final

      const fileName = notaDinas.document;
      const document = path.resolve(
        config.rootPath,
        `public/document/nota-dinas/${notaDinas.tahun}/${fileName}`
      );

      //hash
      const clientId = "TkhRZ7XmPVEOTNtY3XWq7htqWoGpJntl";
      const crn = "ams-gsp-nodejs";
      const timestamp = new Date().toLocaleString();
      const key = "RAHASIA";
      const requestBody = {
        document: fileName,
        signature: JSON.parse(signature),
        timestamp: timestamp,
      };
      const requestBodyString = JSON.stringify(requestBody);
      const payload = requestBodyString + timestamp;
      const hash = CryptoJS.HmacSHA256(payload, key).toString();

      console.log("hash : " + hash);
      console.log("payload : " + payload);
      console.log("flag", flag);

      console.log(user.email);

      const emailTemplatePath = path.resolve(
        config.rootPath,
        `public/html/nota-dinas-masuk.html`
      );

      //2 : approve
      if (flag === "2") {
        let data = new FormData();
        data.append("document", fs.createReadStream(document));
        data.append("signature", signature);
        data.append("crn", crn);
        data.append("ceksum", hash);
        data.append("timestamp", timestamp);

        axios
          .post("https://plnsign.id/setposisi/index.php", data, {
            headers: {
              "Content-Type": "multipart/form-data",
              apikey: "TkhRZ7XmPVEOTNtY3XWq7htqWoGpJntl",
              ...data.getHeaders(),
            },
          })
          .then(async (response) => {
            console.log("[RESPONSE]", response.data);
            if (response.data.status === "ERROR") {
              return res.status(400).json({ error: response.data.message });
            }

            const newResponse = await Response({
              trxId: trxId,
              json: JSON.stringify(response.data),
              ttdOleh: req.session.user.username,
              data: response.data.data,
            });
            await newResponse.save();

            const updateNotaDinas = await NotaDinas.findOneAndUpdate(
              { _id: id },
              { flag, dataResponse: response.data.data }
            );

            const newSent = new NotaDinasSent({
              pengirim: notaDinas.dari,
              penerima: notaDinas.kepada,
              readStatus: false,
              notaDinasId: id,
            });
            await newSent.save();

            const newInbox = new NotaDinasInbox({
              pengirim: notaDinas.dari,
              penerima: notaDinas.kepada,
              readStatus: false,
              notaDinasId: id,
            });
            await newInbox.save();

            res.status(200).json(updateNotaDinas);

            // notif email
            fs.promises
              .readFile(emailTemplatePath, "utf-8")
              .then((emailTemplate) => {
                const html = emailTemplate
                  .replace("{{nomor}}", notaDinas.noNotaDinas)
                  .replace("{{kepada}}", notaDinas.kepada)
                  .replace("{{dari}}", notaDinas.dari)
                  .replace("{{tanggal}}", notaDinas.tanggal)
                  .replace("{{sifat}}", notaDinas.sifat)
                  .replace("{{lampiran}}", notaDinas.jumlahLampiran)
                  .replace("{{hal}}", notaDinas.perihal)
                  .replace("{{isiSurat}}", notaDinas.isiSurat);

                return transporter.sendMail({
                  from: "heru@gsp.co.id",
                  to: user.email,
                  subject: "Nota Dinas Masuk",
                  text: "Hello world?",
                  html: html,
                });
              })
              .then((info) => {
                console.log("[EMAIL_SENT] : %s", info.messageId);
              })
              .catch((error) => {
                console.error("[EMAIL_ERROR]:", error);
              });
          })
          .catch((error) => {
            console.error("[ERROR_RESPONSE]", error);
            res.status(400).json({ error });
          });
      } else {
        const updateNotaDinas = await NotaDinas.findOneAndUpdate(
          { _id: id },
          { flag }
        );
        res.status(200).json({ updateNotaDinas });
      }
    } catch (err) {
      console.log(err);
    }
  },

  setSign: async (req, res) => {
    try {
      const {
        noNotaDinas,
        noAgenda,
        tanggal,
        tahun,
        dari,
        kepada,
        perihal,
        lampiran,
        kodeMasalah,
        sifat,
        keterangan,
        fileAttachment,
        flag,
      } = req.body;
      const divisi = req.session.user.divisi;
      const email = req.session.user.email;
      const nomorModifikasi = noNotaDinas.replace(/\//g, "_");
      const document = path.resolve(
        config.rootPath,
        `public/upload/NOTA_DINAS_${nomorModifikasi}.pdf`
      );
      // const signature = `[{"email":"${email}","detail":[{"p":1,"x":129,"y":203,"w":57,"h":27}]}]`;
      const signature = `[{"email":"${email}","detail":[{"p":1,"x":140,"y":218,"w":47,"h":23}]}]`; //v2
      const ematerai = "";
      const estamp = "";
      const clientId = "TkhRZ7XmPVEOTNtY3XWq7htqWoGpJntl";

      const filename = document.split("\\").pop();
      const crn = "ams-gsp-nodejs";
      const timestamp = new Date().toLocaleString();
      const key = "RAHASIA";
      const requestBody = {
        document: filename,
        signature: JSON.parse(signature),
        timestamp: timestamp,
      };
      const requestBodyString = JSON.stringify(requestBody);
      const payload = requestBodyString + timestamp;
      const hash = CryptoJS.HmacSHA256(payload, key).toString();

      console.log("hash : " + hash);
      console.log("payload : " + payload);

      const newRequest = new Request({
        trxId: trxId,
        document: filename,
        signature: signature,
        ematerai: ematerai,
        estamp: estamp,
        clientId: clientId,
        crn: crn,
        timestamp: timestamp,
      });
      newRequest.save();

      let data = new FormData();
      data.append("document", fs.createReadStream(document));
      data.append("signature", signature);
      data.append("crn", crn);
      data.append("ceksum", hash);
      data.append("timestamp", timestamp);

      axios
        .post("https://plnsign.id/setposisi/index.php", data, {
          // .post("http://localhost/tekencallback/setposisi/", data, {
          headers: {
            "Content-Type": "multipart/form-data",
            apikey: "TkhRZ7XmPVEOTNtY3XWq7htqWoGpJntl",
            // apikey: "amj6Oqx234ON0kxFoFGt8wQeIRIapIby",
            ...data.getHeaders(),
          },
        })
        .then((response) => {
          // todo
          const newResponse = new Response({
            trxId: trxId,
            json: JSON.stringify(response.data),
            ttdOleh: req.session.user.username,
            data: response.data.data,
          });
          newResponse.save();

          const notaDinas = new NotaDinas({
            noNotaDinas,
            noAgenda,
            tanggal,
            tahun,
            dari,
            kepada,
            perihal,
            lampiran,
            sifat,
            email,
            divisi,
            document: filename,
            // fileAttachment,
            dataResponse: response.data.data,
            flag,
          });
          notaDinas.save();

          console.log(response.data);
          res.status(200).json(response.data);
        })
        .catch((error) => {
          console.error(error);
          res.status(400).json({ error });
        });
    } catch (err) {
      console.log(err);
      res.status(400).json({ err });
    }
  },
};
