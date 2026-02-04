import { useState, useRef, useEffect } from 'react';
import { Button, Typography, CircularProgress, Box } from '@mui/material';
import dayjs from 'dayjs';
import { Add, Edit, AddMeta, EditMeta, File } from './dialogs';
import { CustomDataGrid, FieldType } from './components';
import { AppContext, DataContext } from './contexts';
import { getColumns, getRowsMeta, getRows, addBulk, addMetaBulk, editMetaBulk, editBulk, deleteBulk } from './services';
import { PriorityHigh } from '@mui/icons-material';

const App = () => {
    const [cols, setCols] = useState([]);
    const [rows, setRows] = useState([]);
    const [dialog, setDialog] = useState("");
    const [file, setFile] = useState();
    const [preRows, setPreRows] = useState([]);
    const [badRows, setBadRows] = useState([]);
    const [editedRows, setEditedRows] = useState([]);
    const [deletedRows, setDeletedRows] = useState([]);
    const [currRow, setCurrRow] = useState({});
    const metaenum = [["String", 0], ["Integer", 1], ["Float", 2], ["Boolean", 3], ["Date", 4], ["Datetime", 5], ["Menu", 6]];
    const queryParameters = new URLSearchParams(window.location.search);
    const appid = queryParameters.get("appid");
    const dbtable = queryParameters.get("dbtable");
    const mode = queryParameters.get("mode");
    const initiated = useRef(false);
    const [busy, setBusy] = useState(false);
    const [errorPage, setErrorPage] = useState(false);

    useEffect(() => {
        if (initiated.current) {
            return;
        }
        if (mode.endsWith("meta")) {
            setCols([
                {fieldname: "appid", fieldheader: "Qlik App ID"},
                {fieldname: "dbtable", fieldheader: "DB Tablo Adı"},
                {fieldname: "fieldname", fieldheader: "Alan Adı"},
                {fieldname: "fieldtype", fieldheader: "Alan Tipi", fieldtype: FieldType.MENU},
                {fieldname: "fieldheader", fieldheader: "Alan Başlığı"},
                {fieldname: "fieldrequired", fieldheader: "Zorunlu Alan mı?", fieldtype: FieldType.BOOLEAN},
                {fieldname: "fieldorder", fieldheader: "Görünme Sırası", fieldtype: FieldType.INTEGER},
            ]);
            if (mode.startsWith("edit") || mode.startsWith("delete")) {
                getRowsMeta()
                .then((res) => {
                    console.log(res.data);
                    setRows(res.data);
                })
                .catch((err) => {
                    console.log(err);
                });
            }
        }
        else {
            getColumns(appid, dbtable)
            .then((res) => {
                console.log(res.data)
                setCols(res.data);
            })
            .catch((err) => {
                console.log(err);
            });            
        }
        if (mode.startsWith("edit") || mode.startsWith("delete")) {

        }
        initiated.current = true;
    }, []);

    useEffect(() => {
        if (cols.length === 0) {
            return;
        }
        if (mode.endsWith("meta")) {
            return;
        }
        if (mode.startsWith("edit") || mode.startsWith("delete")) {
            getRows(dbtable)
            .then((res) => {
                console.log(res.data);
                setRows(tweak(res.data));
            })
            .catch((err) => {
                console.log(err);
            });
        }
    }, [cols]);

    useEffect(() => {
        if (preRows.length === 0) {
            return;
        }
        console.log("preRows")
        const validRows = [];
        const invalidRows = [];
        for (let i = 0; i < preRows.length; i++) {
            const [isValid, _] = validate(preRows[i]);
            if (isValid) {
                validRows.push(construct(preRows[i]));
            }
            else {
                invalidRows.push(preRows[i]);
            }
        }
        setRows(validRows);
        setBadRows(invalidRows);
        if (invalidRows.length > 0) {
            setCurrRow(invalidRows[0]);
            setDialog("correct");
        }
        setPreRows([]);
    }, [preRows]);

    const handleSubmit = () => {
        setBusy(true);
        if (mode.startsWith("add")) {
            console.log(rows)
            if (!mode.endsWith("meta")) {
                addBulk(rows, appid, dbtable)
                .then((res) => {
                    console.log(res.data);
                })
                .catch((err) => {
                    console.log(err);
                    setBusy(false);
                    setErrorPage(true);
                });
            }
            else {
                addMetaBulk(rows)
                .then((res) => {
                    console.log(res.data);
                })
                .catch((err) => {
                    console.log(err);
                    setBusy(false);
                    setErrorPage(true);
                });
            }
        }
        else if (mode.startsWith("edit")) {
            console.log(editedRows)
            if (!mode.endsWith("meta")) {
                editBulk(editedRows, appid, dbtable)
                .then((res) => {
                    console.log(res.data);
                })
                .catch((err) => {
                    console.log(err);
                    setBusy(false);
                    setErrorPage(true);
                });
            }
            else {
                editMetaBulk(editedRows)
                .then((res) => {
                    console.log(res.data);
                })
                .catch((err) => {
                    console.log(err);
                    setBusy(false);
                    setErrorPage(true);
                });
            }
        }
        else if (mode.startsWith("delete")) {
            console.log(deletedRows)
            if (!mode.endsWith("meta")) {
                deleteBulk(deletedRows, appid, dbtable)
                .then((res) => {
                    console.log(res.data);
                })
                .catch((err) => {
                    console.log(err);
                    setBusy(false);
                    setErrorPage(true);
                });
            }
            else {

            }
        }
    };

    const validate = (row) => {
        let errors = {};
        let valid = true;
        for (let i = 0; i < Object.keys(row).length; i++) {
            let f = Object.keys(row)[i];
            const col = cols.find((c) => c.fieldname === f); 
            errors[f] = {err: false, htxt: ""};
            if ((row[f] === "" || row[f] == null) && col.fieldrequired) {
                errors[f] = {err: true, htxt: "Giriş yapılması zorunludur."};
                valid = false;
            }
            if (valid && col.fieldtype === FieldType.INTEGER) {
                if (row[f] === "" || row[f] == null) {
                    continue;
                }
                const re = /^\-?((\d+)|(\d{1,3}(,\d{3})*)|(\d{1,3}(\.\d{3})*))$/;
                if (!re.test(row[f])) {
                    errors[f] = {err: true, htxt: "Integer değer girilmelidir."};
                    valid = false;
                }
            }
            else if (valid && col.fieldtype === FieldType.FLOAT) {
                if (row[f] === "" || row[f] == null) {
                    continue;
                }
                const re = /^\-?((\d+([\.,]?\d*)?)|(\d{1,3}(,\d{3})*(\.\d*)?)|(\d{1,3}(\.\d{3})*(,\d*)?))$/;
                if (!re.test(row[f])) {
                    errors[f] = {err: true, htxt: "Float değer girilmelidir."};
                    valid = false;
                }
            }
            else if (valid && (col.fieldtype === FieldType.DATE || col.fieldtype === FieldType.DATETIME)) {
                if (row[f] === "" || row[f] == null) {
                    continue;
                }
                const parsedDate = dayjs(row[f], col.fieldformat);
                const strDate = parsedDate.format(col.fieldformat);
                if (strDate !== row[f]) {
                    errors[f] = {err: true, htxt: `Beklenen tarih formatına uymuyor. Girilen değer: ${row[f]}`};
                    valid = false;
                }
            }
        }
        return [valid, errors];
    };

    const construct = (row) => {
        let newRow = {};
        for (let i = 0; i < Object.keys(row).length; i++) {
            let f = Object.keys(row)[i];
            const col = cols.find((c) => c.fieldname === f); 
            let newVal = "";
            if (col.fieldtype === FieldType.INTEGER) {
                if (typeof row[f] === 'string') {
                    if (row[f] === "") {
                        newVal = null;
                    }
                    else {
                        newVal = parseInt(row[f].replaceAll(".", "").replaceAll(",", ""));
                    }                    
                }
                else {
                    newVal = row[f];
                }
            }
            else if (col.fieldtype === FieldType.FLOAT) {
                if (typeof row[f] === 'string') {
                    if (/^\-?(\d{1,3}(,\d{3})*(\.\d*)?)$/.test(row[f])) {
                        newVal = parseFloat(row[f].replaceAll(",", ""));
                    }
                    else if (/^\-?(\d{1,3}(\.\d{3})*(,\d*)?)$/.test(row[f])) {
                        newVal = parseFloat(row[f].replaceAll(".", "").replaceAll(",", "."));
                    }
                    else {
                        if (row[f] === "") {
                            newVal = null;
                        }
                        else {
                            if (row[f].includes(","))
                                row[f] = row[f].replaceAll(",", ".");
                            newVal = parseFloat(row[f]);
                        }
                        
                    }
                }
                else {
                    newVal = row[f];
                }
            }
            else if (col.fieldtype === FieldType.BOOLEAN) {
                newVal = row[f] === '' ? null : row[f];
            }
            else {
                newVal = row[f];
            }
            newRow[f] = newVal;
        }
        return newRow;
    }

    const tweak = (rows) => {
        const dateCols = cols.filter((c) => c.fieldtype === FieldType.DATE || c.fieldtype === FieldType.DATETIME);
        const boolCols = cols.filter((c) => c.fieldtype === FieldType.BOOLEAN);
        for (let i = 0; i < rows.length; i++) {
            for (let j = 0; j < dateCols.length; j++) {
                if (rows[i][dateCols[j].fieldname] === null) {
                    rows[i][dateCols[j].fieldname] = "";
                }
                else {
                    const parsedDate = dayjs(rows[i][dateCols[j].fieldname], dateCols[j].fieldformat);
                    const strDate = parsedDate.format(dateCols[j].fieldformat);
                    if (strDate !== rows[i][dateCols[j].fieldname]) {
                        if (isNaN(rows[i][dateCols[j].fieldname])) {
                            let parsedDate2 = Date.parse(rows[i][dateCols[j].fieldname]);
                            if (dateCols[j].fieldtype === FieldType.DATETIME) {
                                const parsedDateObj = new Date(parsedDate2);
                                parsedDate2 += parsedDateObj.getTimezoneOffset() * 60 * 1000;
                            }
                            const strDate2 = dayjs(parsedDate2).format(dateCols[j].fieldformat);
                            rows[i][dateCols[j].fieldname] = strDate2;
                        }
                    }
                }                
            }  
            for (let j = 0; j < boolCols.length; j++) {
                if (typeof rows[i][boolCols[j].fieldname] === 'string') {
                    let val = rows[i][boolCols[j].fieldname];
                    rows[i][boolCols[j].fieldname] = (val === "true" || val === "1") ? true : ((val === "false" || val === "0") ? false : null)
                }
            }  
        }
        return rows;
    }

    return (
        <div className="App">
            <AppContext.Provider value={{mode, dialog, setDialog, busy, setBusy, errorPage, file, setFile}}>
                <DataContext.Provider value={{cols, rows, setRows, preRows, setPreRows, badRows, 
                    editedRows, setEditedRows, deletedRows, setDeletedRows, setBadRows, currRow, setCurrRow}}>
                    <Box sx={{ height: "100dvh", width: '100dvw', filter: (busy || errorPage) ? "blur(2px)" : "blur(0px)"}}>
                        <CustomDataGrid metaenum={metaenum} />
                        {dialog === "add" && (<Add validate={validate} construct={construct} />)}
                        {dialog === "addmeta" && (<AddMeta metaenum={metaenum} />)}
                        {dialog === "editmeta" && (<EditMeta metaenum={metaenum} />)}
                        {dialog === "file" && (<File tweak={tweak} />)}
                        {dialog === "edit" && (<Edit validate={validate} construct={construct}/>)}  
                        {dialog === "correct" && (<Edit validate={validate} construct={construct} correction={true} />)}                 
                    </Box>  
                </DataContext.Provider>
            </AppContext.Provider>
            {mode !== "editmeta" && <Button
                disabled={(
                    mode.startsWith("add") && rows.length === 0) || 
                    (mode === "edit" && editedRows.length === 0) || 
                    (mode.startsWith("delete") && deletedRows.length === 0) || 
                    busy || errorPage}
                variant="contained" 
                sx={{position: "absolute", bottom: "10px", left: "10px", filter: (busy || errorPage) ? "blur(2px)" : "blur(0px)"}}
                onClick={handleSubmit}
            >
                {mode.startsWith("delete") ? "SİL" : "Tümünü Kaydet"}
            </Button>}
            {busy && (
                <div style={{width: "100dvw", height: "100dvh", position: "absolute", textAlign: "center", zIndex: 1301, top: "0", left: "0"}}>
                    <CircularProgress sx={{position: "absolute", left: "50dvw", top: "50dvh", translate: "-50% -50%"}} size="3rem" />
                    <Typography sx={{fontWeight: "600", marginTop: "calc(50dvh - 60px)", color: "#1976d2", fontFamily: "inherit"}}>Lütfen Bekleyiniz...</Typography>
                </div>
            )}
            {errorPage && (
                <div style={{width: "100dvw", height: "100dvh", position: "absolute", textAlign: "center", zIndex: 1301, top: "0", left: "0"}}>
                    <CircularProgress color='error' variant="determinate" value={100} sx={{position: "absolute", left: "50dvw", top: "50dvh", translate: "-50% -50%"}} size="3rem" />
                    <PriorityHigh color='error' sx={{position: "absolute", left: "50dvw", top: "50dvh", translate: "-50% -50%"}} size="3rem" />
                    <Typography sx={{fontWeight: "600", marginTop: "calc(50dvh - 60px)", color: "#d32f2f", fontFamily: "inherit"}}>Hata ile karşılaşıldı, lütfen sayfayı yenileyiniz.</Typography>
                </div>
            )}
        </div>
    );
};

export default App;
