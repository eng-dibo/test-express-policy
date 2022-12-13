import express, { Request, Response } from "express";

let app = express();

app.use("*", (req: Request, res: Response) => res.send("OK"));

app.listen(5000, () => console.log("listening..."));

// fetch(`http://localhost:5000`)
