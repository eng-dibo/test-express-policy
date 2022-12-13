import express, { NextFunction, Request, Response } from "express";

let app = express();

// set CSP
app.use((req: Request, res: Response) =>
  res.set("Content-Security-Policy", "default-src 'self'; content-src 'self'")
);

app.use("/ok", (req: Request, res: Response) => res.send("ok"));

app.use("*", (req: Request, res: Response, next: NextFunction) =>
  next("error")
);

app.listen(5000, () => console.log("listening..."));

// // fetch:
// fetch(`http://localhost:5000/ok`);

// // ajax:
// let oReq = new XMLHttpRequest();
// oReq.open("get", "http://localhost:5000/ok", true);
// oReq.send();
// console.log(oReq.response);
