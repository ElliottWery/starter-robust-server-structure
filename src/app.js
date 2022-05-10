const express = require("express");
const app = express();

const counts = require("./data/counts-data");
const flips = require("./data/flips-data");


app.use(express.json())

app.use("/counts/:countId", (req, res, next) => {
  const { countId } = req.params;
  const foundCount = counts[countId];

  if (foundCount === undefined) {
    next(`Count id not found" ${countId}`);
  } else {
    res.json({ data: foundCount });
  }
});

app.use("/counts", (req, res) => {
  res.json({ data: counts });
});

app.use("/flips/:flipId", (req, res, next) => {
  const { flipId } = req.params;
  const foundFlip = flips.find((flip) => flip.id === Number(flipId));
  if (foundFlip) {
    res.json({ data: foundFlip });
  } else {
    next(`Flip id not found: ${flipId}`);
  }
});

+ app.get("/flips", (req, res) => {
  res.json({ data: flips });
});

let lastFlipId = flips.reduce((maxId, flip) => Math.max(maxId, flip.id), 0);

function bodyHasResultProperty(req, res, next) {
  const { data: { result } = {} } = req.body;
  if (result) {
    return next();
  }
  next({
    status: 400,
    message: "A 'result' property is required.",
  });
}

app.post(
  "/flips",
  bodyHasResultProperty, // Add validation middleware function
  (req, res) => {
    // Route handler no longer has validation code.
    const { data: { result } = {} } = req.body;
    const newFlip = {
      id: ++lastFlipId, // Increment last ID, then assign as the current ID
      result: result,
    };
    flips.push(newFlip);
    res.status(201).json({ data: newFlip });
  }
);

// Not found handler
app.use((request, response, next) => {
  next(`Not found: ${request.originalUrl}`);
});

// Error handler
app.use((error, req, res, next) => {
  console.error(error);
  const { status = 500, message = "Something went wrong!" } = error;
  res.status(status).json({ error: message });
});
module.exports = app;
