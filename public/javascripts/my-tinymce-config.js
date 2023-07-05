tinymce.init({
  selector: "textarea#my-expressjs-tinymce-app",
  // content_style: "body { padding: 100px 100px; }",

  height: 300,
  // width: 300,
  menubar: false,
  branding: false,
  // statusbar: false,
  plugins: [
    "advlist",
    "autolink",
    "lists",
    "link",
    "image",
    "charmap",
    "preview",
    "anchor",
    "searchreplace",
    "visualblocks",
    "fullscreen",
    "insertdatetime",
    "media",
    "table",
    "help",
    "wordcount",
    "pagebreak",
    "code",
    "autoresize",
  ],
  toolbar: `undo redo | bold italic underline backcolor |  
    alignleft aligncenter alignright alignjustify| pagebreak | 
    bullist numlist checklist outdent indent | removeformat | a11ycheck code table help`,
});
