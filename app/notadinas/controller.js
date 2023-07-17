const path = require("path");
const fs = require("fs");
const config = require("../../config");
const axios = require("axios");
const FormData = require("form-data");
const CryptoJS = require("crypto-js");
const { v4: uuidv4 } = require("uuid");
const trxId = uuidv4();

const NotaDinas = require("../../app/notadinas/model");
const DisposisiMaster = require("../../app/notadinas/modelDisposisi");
const NotaDinasSent = require("../../app/notadinas/modelSent");
const NotaDinasInbox = require("../../app/notadinas/modelInbox");
const Users = require("../../app/users/model");
const Response = require("../../app/notadinas/modelResponse");
const Request = require("../../app/notadinas/modelRequest");
const Callback = require("../../app/callback/model");
const Klasifikasi = require("../../app/notadinas/modelKlasifikasi");

module.exports = {
  index: async (req, res) => {
    try {
      const alertMessage = req.flash("alertMessage");
      const alertStatus = req.flash("alertStatus");
      const alert = { message: alertMessage, status: alertStatus };

      const username = req.session.user.username;
      const jabatan = req.session.user.jabatan.sebutanJabatan;
      const notaDinas = await NotaDinas.find({
        kepada: jabatan,
        flag: 2,
      });
      const disposisiMaster = await DisposisiMaster.find();
      const users = await Users.find();
      const historyDisposisi = await NotaDinasSent.find();
      // for of  async
      for (const data of notaDinas) {
        const id = data.dataResponse.id;
        const fileName = data.document;
        const signed = await Callback.findOne({ documentId: id });
        const outputFilePath = path.resolve(
          config.rootPath,
          `public/upload/signed/${fileName}`
        );

        if (fs.existsSync(outputFilePath)) {
          console.log("File already exists.");
        } else {
          try {
            const response = await axios({
              url: signed.downloadUrl,
              method: "GET",
              responseType: "stream",
            });

            response.data.pipe(fs.createWriteStream(outputFilePath));

            await new Promise((resolve, reject) => {
              response.data.on("end", () => {
                console.log("File downloaded successfully.");
                resolve();
              });

              response.data.on("error", (err) => {
                console.error("Error downloading file:", err);
                reject(err);
              });
            });
          } catch (error) {
            console.error("Error downloading file:", error);
          }
        }
      }

      res.render("notadinas/index", {
        notaDinas,
        alert,
        disposisiMaster,
        historyDisposisi,
        users,
        title: "Nota Dinas",
        subtitle: "Nota Dinas Masuk",
        username,
        jabatan: req.session.user.jabatan,
      });
    } catch (err) {
      console.log(err);
    }
  },

  terkirim: async (req, res) => {
    try {
      const username = req.session.user.username;
      const jabatan = req.session.user.jabatan.sebutanJabatan;
      console.log(jabatan);
      const notaDinasTerkirim = await NotaDinas.find({
        pengirim: jabatan,
        // flag: 2,
      });
      res.render("notadinas/terkirim/index", {
        notaDinasTerkirim,
        title: "Nota Dinas",
        subtitle: "Nota Dinas Terkirim",
        username,
        jabatan: req.session.user.jabatan,
      });
    } catch (err) {
      console.log(err);
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

      // for of  async
      for (const data of notaDinasApproved) {
        const id = data.dataResponse.id;
        const fileName = data.document;
        const signed = await Callback.findOne({ documentId: id });
        const outputFilePath = path.resolve(
          config.rootPath,
          `public/upload/signed/${fileName}`
        );

        if (fs.existsSync(outputFilePath)) {
          console.log("File already exists.");
        } else {
          try {
            const response = await axios({
              url: signed.downloadUrl,
              method: "GET",
              responseType: "stream",
            });

            response.data.pipe(fs.createWriteStream(outputFilePath));

            await new Promise((resolve, reject) => {
              response.data.on("end", () => {
                console.log("File downloaded successfully.");
                resolve();
              });

              response.data.on("error", (err) => {
                console.error("Error downloading file:", err);
                reject(err);
              });
            });
          } catch (error) {
            console.error("Error downloading file:", error);
          }
        }
      }
      res.render("notadinas/persetujuan/index", {
        notaDinas,
        title: "Nota Dinas",
        subtitle: "Persetujuan Nota Dinas",
        username,
        jabatan: req.session.user.jabatan,
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
        username: req.session.user.username,
        jabatan: req.session.user.jabatan,
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
        attachment,
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
      const { notaDinasKode, sentKode, tindakLanjut, disposisi, penerima } =
        req.body;

      const notaDinasSent = await NotaDinasSent({
        pengirim: req.session.user.username,
        penerima,
        notaDinasKode,
        // sentKode,
        disposisi,
        tindakLanjut,
      });
      await notaDinasSent.save();
      res.status(200).json(notaDinasSent);
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
        username: req.session.user.username,
        jabatan: req.session.user.jabatan,
        divisi,
      });
    } catch (err) {
      console.log(err);
    }
  },

  savePdf: async (req, res) => {
    try {
      const pdfBase64 = req.body.document; //base64
      const nomor = req.body.nomor;
      const nomorModifikasi = nomor.replace(/\//g, "_");
      const outputPath = path.resolve(
        config.rootPath,
        `public/upload/NOTA_DINAS_${nomorModifikasi}.pdf`
      );

      const dataPdf = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
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
        pengirim,
        perihal,
        jumlahLampiran,
        jenisLampiran,
        kodeKlasifikasi,
        sifat,
        isiSurat,
        tembusan,
        keterangan,
        fileAttachment,
        email,
        divisi,
        flag,
      } = req.body;
      const nomor = noNotaDinas.replace(/\//g, "_");
      const document = path.resolve(
        config.rootPath,
        `public/upload/NOTA_DINAS_${nomor}.pdf`
      );
      const filename = document.split("\\").pop();

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
            const newNotaDinas = new NotaDinas({
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
              keterangan,
              attachment: attachmentFileName,
              email,
              divisi,
              document: filename,
              flag: 1,
            });
            const savedNotaDinas = await newNotaDinas.save();
            res.status(200).json({ savedNotaDinas });
          } catch (err) {
            console.log(err);
          }
        });
      } else {
        try {
          const newNotaDinas = new NotaDinas({
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
            keterangan,
            email,
            divisi,
            document: filename,
            flag: 1,
          });
          const savedNotaDinas = await newNotaDinas.save();
          res.status(200).json({ savedNotaDinas });
        } catch (err) {
          console.log(err);
        }
      }
    } catch (err) {
      console.log(err);
      res.status(400).json({ err });
    }
  },

  actionPersetujuan: async (req, res) => {
    try {
      const { id } = req.params;
      const { flag } = req.body;
      const notaDinas = await NotaDinas.findById(id);
      // const email = req.session.user.email;
      const email = "heru@gsp.co.id";
      // const signature = `[{"email":"${email}","detail":[{"p":1,"x":140,"y":218,"w":47,"h":23}]}]`; //v2
      const signature = `[{"email":"${email}","detail":[{"p":1,"x":130,"y":220,"w":50,"h":24}]}]`; //final

      const fileName = notaDinas.document;
      const document = path.resolve(
        config.rootPath,
        `public/upload/${fileName}`
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
      console.log("flag", typeof flag);
      // return;

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
              // apikey: "amj6Oqx234ON0kxFoFGt8wQeIRIapIby",
              ...data.getHeaders(),
            },
          })
          .then(async (response) => {
            //insert data response
            const newResponse = await Response({
              trxId: trxId,
              json: JSON.stringify(response.data),
              ttdOleh: req.session.user.username,
              data: response.data.data,
            });
            await newResponse.save();
            //update
            const updateNotaDinas = await NotaDinas.findOneAndUpdate(
              { _id: id },
              { flag, dataResponse: response.data.data }
            );
            console.log(response.data);
            res.status(200).json(updateNotaDinas);
          })
          .catch((error) => {
            console.error(error);
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
