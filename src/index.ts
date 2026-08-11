import app from "./app.js"

const configuredPort = Number.parseInt(process.env.PORT ?? "3000", 10);
const port = Number.isInteger(configuredPort) && configuredPort > 0 && configuredPort <= 65535
  ? configuredPort
  : 3000;

app.listen(port, () => {
    console.log(`listening on port ${port}`);
});
