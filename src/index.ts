import express, { NextFunction, Request, Response } from "express";

let app = express();

app.use("*", (req: Request, res: Response, next: NextFunction) => {
  next(
    `no route to handle the incoming request ${req.method} ${req.originalUrl}`
  );
});

app.listen(5000, () => console.log("listening..."));

// fetch(`http://localhost:5000`)
