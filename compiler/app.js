var child = require("child_process");
const express = require("express");
const app = express();
const fs = require("fs");
var multer = require("multer");
var cors = require("cors")({ origin: true });
// console.log(process.cwd());
var upload = multer({ dest: "uploads/" });
const port = 80;
const unzipper = require("unzipper");
app.use(cors);
app.use(express.static(__dirname + "/"));
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.raw({
//     type:'application/octet-stream'
// }));

function errorHandler(error, stdout, stderr) {
    if (stderr) {
        res.status(400);
        res.send(stderr);
    }
    if (error) {
        res.status(400);
        res.send(error);
    }
}

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});
app.post("/compile", upload.single("myCode"), function(req, res) {
    // console.log(req.file);
    // console.log(req.body);
    //   console.log(req.body);
    var ip = req.header("x-forwarded-for") || req.connection.remoteAddress;
    console.log("Request made by:", ip);
    var stdin = req.body.input_text;
    var folderName = req.file.originalname;
    if (folderName.indexOf(" ") > -1) {
        res.status(400);
        return res.send("zip file name can't have spaces");
    }
    var entrypoint = req.body.entrypoint;
    var data = fs.createReadStream(__dirname + "/" + req.file.path);
    data.pipe(
        unzipper
            .Extract({ path: __dirname + "/data/" })
            .on("close", function() {
                var stdout;
                var startTime;
                var endTime;
                var workdir = ".";
                switch (req.body.language) {
                    case "python":
                        startTime = new Date();
                        try {
                            stdout = child
                                .execSync(
                                    "valgrind --tool=massif python3 data/" +
                                        folderName.slice(
                                            0,
                                            folderName.length - 4
                                        ) +
                                        "/" +
                                        entrypoint,
                                    { input: stdin, timeout: 60000 }
                                )
                                .toString();
                        } catch (error) {
                            var MemData = child
                                .execSync("find . -name 'massif.out.*'", {
                                    cwd: workdir
                                })
                                .toString();
                            child.execSync("rm " + MemData, { cwd: workdir });
                            child.execSync("rm -r data");
                            child.execSync(
                                "rm " + __dirname + "/" + req.file.path
                            );
                            res.status(400);
                            res.send({ error: error.message });

                            return;
                        }

                        endTime = new Date();
                        break;
                    case "C":
                        try {
                            child.execSync(
                                "gcc -o Ccode data/" +
                                    folderName.slice(0, folderName.length - 4) +
                                    "/" +
                                    entrypoint
                            );
                        } catch (error) {
                            child.execSync("rm -r data");
                            child.execSync(
                                "rm " + __dirname + "/" + req.file.path
                            );
                            res.status(400);
                            res.send({ error: error.message });
                            return;
                        }

                        startTime = new Date();
                        try {
                            stdout = child
                                .execSync("valgrind --tool=massif ./Ccode", {
                                    input: stdin,
                                    timeout: 60000
                                })
                                .toString();
                        } catch (error) {
                            var MemData = child
                                .execSync("find . -name 'massif.out.*'", {
                                    cwd: workdir
                                })
                                .toString();
                            child.execSync("rm " + MemData, { cwd: workdir });
                            child.execSync("rm -r data");
                            child.execSync(
                                "rm " + __dirname + "/" + req.file.path
                            );
                            res.status(400);
                            res.send({ error: error.message });
                            return;
                        }

                        endTime = new Date();
                        break;
                    case "C++":
                        try {
                            child.execSync(
                                "g++ -o Ccode data/" +
                                    folderName.slice(0, folderName.length - 4) +
                                    "/" +
                                    entrypoint
                            );
                        } catch (error) {
                            child.execSync("rm -r data");
                            child.execSync(
                                "rm " + __dirname + "/" + req.file.path
                            );
                            res.status(400);
                            res.send({ error: error.message });
                            return;
                        }
                        startTime = new Date();
                        try {
                            stdout = child
                                .execSync("valgrind --tool=massif ./Ccode", {
                                    input: stdin,
                                    timeout: 60000
                                })
                                .toString();
                        } catch (error) {
                            var MemData = child
                                .execSync("find . -name 'massif.out.*'", {
                                    cwd: workdir
                                })
                                .toString();
                            child.execSync("rm " + MemData, { cwd: workdir });
                            child.execSync("rm -r data");
                            child.execSync(
                                "rm " + __dirname + "/" + req.file.path
                            );
                            res.status(400);
                            res.send({ error: error.message });
                            return;
                        }
                        endTime = new Date();
                        break;
                    case "java":
                        workdir =
                            "data/" +
                            folderName.slice(0, folderName.length - 4) +
                            "/";
                        try {
                            child.execSync("javac " + entrypoint, {
                                cwd:
                                    "data/" +
                                    folderName.slice(0, folderName.length - 4) +
                                    "/"
                            });
                        } catch (error) {
                            child.execSync("rm -r data");
                            child.execSync(
                                "rm " + __dirname + "/" + req.file.path
                            );
                            res.status(400);
                            res.send({ error: error.message });
                            return;
                        }
                        startTime = new Date();
                        try {
                            stdout = child
                                .execSync(
                                    "valgrind --tool=massif java " +
                                        entrypoint.slice(
                                            0,
                                            entrypoint.length - 5
                                        ),
                                    {
                                        cwd:
                                            "data/" +
                                            folderName.slice(
                                                0,
                                                folderName.length - 4
                                            ) +
                                            "/",
                                        input: stdin,
                                        timeout: 60000
                                    }
                                )
                                .toString();
                        } catch (error) {
                            var MemData = child
                                .execSync("find . -name 'massif.out.*'", {
                                    cwd: workdir
                                })
                                .toString();
                            child.execSync("rm " + MemData, { cwd: workdir });
                            child.execSync("rm -r data");
                            child.execSync(
                                "rm " + __dirname + "/" + req.file.path
                            );
                            res.status(400);
                            res.send({ error: error.message });
                            return;
                        }
                        endTime = new Date();

                        break;
                }
                var MemData = child
                    .execSync("find . -name 'massif.out.*'", { cwd: workdir })
                    .toString();
                var sortedData = child
                    .execSync("ms_print " + MemData, { cwd: workdir })
                    .toString();
                var unit = sortedData.split("\n")[7].trim();
                var value = sortedData.split("\n")[8];
                value = value.slice(0, value.indexOf("^"));
                var memory = value + " " + unit;
                child.execSync("rm " + MemData, { cwd: workdir });
                child.execSync("rm -r data");
                child.execSync("rm " + __dirname + "/" + req.file.path);
                var result = {
                    stdout: stdout,
                    timeTaken: endTime - startTime,
                    memory: memory
                };
                res.status(200);
                res.send(result);
            })
    );
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
