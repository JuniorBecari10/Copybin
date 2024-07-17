const express = require("express");
const bodyParser = require("body-parser");

const port = process.env.PORT || 8080;
const app = express();
const data = [];

app.set("view engine", "hbs");
app.set("views", "views");

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const random = (min, max) => Math.floor(Math.random() * (max - min) + min);

const latest = (slice) => data.slice(-slice).map(text => {
  const newText = {
    name: text.name.slice(0, 50),
    text: text.text.slice(0, 100),
    id: text.id
  };

  return newText;
});

const getText = (name) => data.filter(t => t.name === name)[0];
const getTextId = (id) => data.filter(t => t.id == id)[0];

app.get("/", (_, res) => res.render("index", { submit: true, texts: latest(5), form: true }));
app.get("/all", (_, res) => {
  if (data.length === 0)
    return res.redirect("/");

  res.render("index", { submit: true, texts: latest(0), form: false });
});
// app.get("/latest", () => latest());

app.get("/id", (req, res) => {
  const id = req.query.id;

  if (!id) {
    res.render("index", { message: "Provide an ID.", submit: true, texts: latest(), form: true });
    return;
  }

  const text = getTextId(id);

  if (!text) {
    res.render("index", { message: "The requested text with ID " + id + " doesn't exist.", submit: true, texts: latest(), form: true });
    return;
  }

  res.render("index", { readonly: true, submit: false, name: text.name, text: text.text, texts: latest(), form: true });
});

app.get("/search", (req, res) => {
  const name = req.query.name;

  if (!name) {
    res.render("index", { message: "Provide a text name.", submit: true, texts: latest(), form: true });
    return;
  }

  const text = getText(name);

  if (!text) {
    res.render("index", { message: "Text '" + name + "' doesn't exist.", submit: true, texts: latest(), form: true });
    return;
  }

  res.render("index", { readonly: true, submit: false, name: text.name, text: text.text, texts: latest(), form: true });
});

app.post("/send", async (req, res) => {
  const body = req.body;

  if (!(body.name && body.text)) {
    res.render("index", { message: "Check if all fields were filled correctly.", submit: true, texts: latest(), form: true });
    return;
  }

  if (data.some((text) => text.name === body.name)) {
    res.render("index", { message: "There's a text with this name already.", submit: true, texts: latest(), form: true });
    return;
  }

  const id = random(0, 999999);

  if (data.some(text => text.id === id)) {
    res.render("index", { message: "Cannot upload more texts since all IDs have been used.", submit: true, texts: latest(), form: true });
    return;
  }

  data.push({
    name: body.name,
    text: body.text.trim(),
    id: id,
  });

  res.redirect("/");
});

app.listen(port, () => console.log("Running on port 8080"));
