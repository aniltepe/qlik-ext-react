import { useEffect, useState, useContext, useRef } from 'react';
import { DataGrid, Toolbar, GRID_DATE_COL_DEF, getGridDateOperators, GRID_DATETIME_COL_DEF,
    ToolbarButton, ExportCsv, FilterPanelTrigger } from '@mui/x-data-grid';
import { Button, Typography, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { Delete, Edit, MoreVert, Visibility } from '@mui/icons-material';
import { FieldType, TrGrid } from '../components';
import { AppContext, DataContext } from '../contexts';
import { postCsv, postXls } from '../services';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import updateLocale from 'dayjs/plugin/updateLocale';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(updateLocale);
dayjs.extend(customParseFormat);
dayjs.updateLocale('en', {
    weekStart: 1, 
    weekdays: ["Pa", "Pt", "Sa", "Ça", "Pe", "Cu", "Ct"], 
    monthsShort: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"], 
    months: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
});

const CustomDataGrid = (props) => {
    const {mode, setDialog} = useContext(AppContext);
    const {cols, rows, setRows, editedRows, setDeletedRows, setCurrRow} = useContext(DataContext);
    const [columns, setColumns] = useState([]);

    useEffect(() => {
        const newCols = [{
            field: "datagrid_row_id",
            headerName: "#",
            width: 100,
            resizable: false,
            type: 'number',
            disableExport: true,
        }];
        for (let i = 0; i < cols.length; i++) {
            let newCol = {};
            if (cols[i].fieldtype === FieldType.DATE) {
                newCol = {
                    ...GRID_DATE_COL_DEF,
                    field: cols[i].fieldname, 
                    headerName: cols[i].fieldheader,
                    flex: 1,
                    type: 'date',
                    filterOperators: getGridDateOperators(false).map((item) => {
                        const newItem = {
                            ...item,
                            InputComponent: CustomDateFilter,
                            InputComponentProps: { dateformat: cols[i].fieldformat },
                            getApplyFilterFn: (filterItem) => {
                                if (item.value === "is")
                                    return buildApplyFilterFn(filterItem, cols[i].fieldformat, (value1, value2) => value1 === value2, false);
                                else if (item.value === "not")
                                    return buildApplyFilterFn(filterItem, cols[i].fieldformat, (value1, value2) => value1 !== value2, false);
                                else if (item.value === "after")
                                    return buildApplyFilterFn(filterItem, cols[i].fieldformat, (value1, value2) => value1 > value2, false);
                                else if (item.value === "onOrAfter")
                                    return buildApplyFilterFn(filterItem, cols[i].fieldformat, (value1, value2) => value1 >= value2, false);
                                else if (item.value === "before")
                                    return buildApplyFilterFn(filterItem, cols[i].fieldformat, (value1, value2) => value1 < value2, false, true);
                                else if (item.value === "onOrBefore")
                                    return buildApplyFilterFn(filterItem, cols[i].fieldformat, (value1, value2) => value1 <= value2, false);
                                else if (item.value === "isEmpty")
                                    return value => value == null;
                                else if (item.value === "isNotEmpty")
                                    return value => value != null;
                            }
                        }
                        return newItem;
                    }),
                    valueGetter: (value) => dayjs(value, cols[i].fieldformat).toDate(),
                    valueFormatter: (value) => value === "" ? "Geçersiz Tarih" : dayjs(value).format(cols[i].fieldformat),
                };
            }
            if (cols[i].fieldtype === FieldType.DATETIME) {
                newCol = {
                    ...GRID_DATETIME_COL_DEF,
                    field: cols[i].fieldname, 
                    headerName: cols[i].fieldheader,
                    flex: 1,
                    type: 'dateTime',
                    filterOperators: getGridDateOperators(false).map((item) => {
                        const newItem = {
                            ...item,
                            InputComponent: CustomDateTimeFilter,
                            InputComponentProps: { dateformat: cols[i].fieldformat },
                            getApplyFilterFn: (filterItem) => {
                                if (item.value === "is")
                                    return buildApplyFilterFn(filterItem, cols[i].fieldformat, (value1, value2) => value1 === value2, true);
                                else if (item.value === "not")
                                    return buildApplyFilterFn(filterItem, cols[i].fieldformat, (value1, value2) => value1 !== value2, true);
                                else if (item.value === "after")
                                    return buildApplyFilterFn(filterItem, cols[i].fieldformat, (value1, value2) => value1 > value2, true);
                                else if (item.value === "onOrAfter")
                                    return buildApplyFilterFn(filterItem, cols[i].fieldformat, (value1, value2) => value1 >= value2, true);
                                else if (item.value === "before")
                                    return buildApplyFilterFn(filterItem, cols[i].fieldformat, (value1, value2) => value1 < value2, true, false);
                                else if (item.value === "onOrBefore")
                                    return buildApplyFilterFn(filterItem, cols[i].fieldformat, (value1, value2) => value1 <= value2, true);
                                else if (item.value === "isEmpty")
                                    return value => value == null;
                                else if (item.value === "isNotEmpty")
                                    return value => value != null;
                            }
                        }
                        return newItem;
                    }),
                    valueGetter: (value) => value === "" ? null : dayjs(value, cols[i].fieldformat),
                    valueFormatter: (value) => value === null ? "" : dayjs(value).format(cols[i].fieldformat),
                };
            }
            else if (cols[i].fieldtype === FieldType.MENU) {
                newCol = {
                    field: cols[i].fieldname, 
                    headerName: cols[i].fieldheader,
                    flex: 1,
                    valueFormatter: (value) => {
                        if (!mode.endsWith("meta")) {
                            if (value === "" || value == null) {
                                return "";
                            }
                            const res = cols[i].fieldenum.split(";").find((val) => val.split(",")[1] === value);
                            if (res)
                                return res.split(",")[0];
                            else
                                return "Geçersiz değer";
                        }
                        else {
                            const res = props.metaenum.find((val) => val[1] === value);
                            if (res)
                                return res[0];
                            else
                                return "Geçersiz değer";
                        }
                    }
                };
            }
            else if (cols[i].fieldtype === FieldType.BOOLEAN) {
                newCol = {
                    field: cols[i].fieldname, 
                    headerName: cols[i].fieldheader,
                    flex: 1,
                    type: 'string',
                    valueGetter: (value) => (value == null || value === '') ? '' : (value  ? 'Evet' : 'Hayır'),
                };
            }
            else {
                newCol = {
                    field: cols[i].fieldname, 
                    headerName: cols[i].fieldheader,
                    flex: 1,
                    type: (cols[i].fieldtype === FieldType.INTEGER || cols[i].fieldtype === FieldType.FLOAT) 
                        ? 'number' : 'string',
                };
            }
            newCols.push(newCol);
        }
        if (mode.startsWith("add")) {
            newCols.push({
                field: "discard_btn",
                headerName: "",
                width: 60,
                resizable: false,
                disableColumnMenu: true,
                sortable: false,
                disableExport: true,
                filterable: false,
                renderCell: (params) => (<IconButton onClick={() => removeRow(params.row)}><Delete /></IconButton>)
            });
        }    
        else if (mode.startsWith("edit")) {
            newCols.push({
                field: "edit_btn",
                headerName: "",
                width: 60,
                resizable: false,
                disableColumnMenu: true,
                sortable: false,
                disableExport: true,
                filterable: false,
                renderCell: (params) => (<IconButton onClick={() => editRow(params.row)}>{mode.endsWith("meta") ? <Visibility /> : <Edit />}</IconButton>)
            });
        }
        setColumns(newCols);
    }, [cols]);

    const removeRow = (row) => {
        setRows((rows) => rows.filter((val) => {
            for (let i = 0; i < Object.keys(val).length; i++) {
                const key = Object.keys(val)[i];
                if (val[key] !== row[key]) {
                    return true;
                }
            }
            return false;
        }))
    };

    const editRow = (row) => {
        // console.log(row)
        setCurrRow(row);
        setDialog(mode);
    };

    const handleCheckBox = (rows, evt) => {
        setDeletedRows([...rows.ids].map((id) => {
            const {datagrid_row_id, ...rest} = evt.api.caches.rows.dataRowIdToModelLookup[id];
            return rest;
        }));
    };
    
    return (
        <DataGrid
            rows={rows.map((val, idx) => { return {...val, datagrid_row_id: idx + 1}})}
            // rows={rows}
            columns={columns}
            getRowId={(row) => Object.values(row).join("|||")}
            getRowClassName={(params) => editedRows.map((r) => r.dgrowid).includes(params.row.datagrid_row_id) ? 'edited-muidatagrid-row' : ''}
            showToolbar
            slots={{ toolbar: CustomToolbar }}
            initialState={{
                pagination: {
                    paginationModel: {
                        pageSize: 20,
                    },
                },
            }}
            disableColumnSelector={true}
            pageSizeOptions={[20, 50, 100]}
            checkboxSelection={mode.startsWith("delete")}
            onRowSelectionModelChange={handleCheckBox}
            disableRowSelectionOnClick
            localeText={TrGrid}
            sx={{
                '& .edited-muidatagrid-row': {
                    backgroundColor: '#e0f8f9',
                },
            }}
        />
    );
};

const CustomToolbar = () => {
    const {mode, setDialog, busy, setBusy, errorPage, setFile} = useContext(AppContext);
    const {rows, setRows, editedRows, deletedRows} = useContext(DataContext);
    const [otherMenuOpen, setOtherMenuOpen] = useState(false);
    const otherMenuRef = useRef();
    const inputCsvRef = useRef();
    const buttonCsvRef = useRef();
    const inputXlsRef = useRef();
    const buttonXlsRef = useRef();

    const handleCsvUpload = (evt) => {
        evt.preventDefault();
        console.log("file uploaded", inputCsvRef.current.files[0]);
        setBusy(true);
        postCsv(inputCsvRef.current.files[0])
            .then((res) => {
                console.log(res.data);
                setFile(res.data);
                setBusy(false);
                setDialog("file");
            })
            .catch((err) => console.log(err));
        evt.target.reset();
    };

    const handleXlsUpload = (evt) => {
        evt.preventDefault();
        console.log("file uploaded", inputXlsRef.current.files[0]);
        setBusy(true);
        postXls(inputXlsRef.current.files[0])
            .then((res) => {
                console.log(res.data);
                setFile(res.data);
                setBusy(false);
                setDialog("file");
            })
            .catch((err) => console.log(err));
        evt.target.reset();
    };

    const handleCsvFile = () => buttonCsvRef.current.click();

    const handleXlsFile = () => buttonXlsRef.current.click();

    const handleCsv = () => inputCsvRef.current.click();

    const handleXls = () => inputXlsRef.current.click();

    return (
        <Toolbar>
            <Typography fontWeight="bold" sx={{ flex: 1, mx: 0.5 }}>{
                mode.startsWith("add") ? "EKLENECEK KAYITLAR" : mode === "edit" ? "KAYIT DÜZENLEME" : mode.startsWith("delete") ? "KAYIT SİLME" : ""
            }</Typography>
            <div style={{display: "flex", justifyContent: "space-between", gap: "15px"}}>
                {mode.startsWith("add") && <Button onClick={() => setDialog(mode)} disabled={busy || errorPage} variant="contained">Satır Ekle</Button>}
                {mode.startsWith("add") && !mode.endsWith("meta") && (
                    <>
                        <form style={{display: "none"}} method="post" action="/api/uploadcsv" onSubmit={handleCsvUpload}>
                            <input ref={inputCsvRef} onChange={handleCsvFile} type="file" accept='.csv' />
                            <input ref={buttonCsvRef} type="submit" />
                        </form>
                        <Button onClick={handleCsv} disabled={busy || errorPage} variant="contained">CSV Yükle</Button>                    
                    </>                    
                )}
                {mode.startsWith("add") && !mode.endsWith("meta") && (
                    <>
                        <form style={{display: "none"}} method="post" action="/api/uploadxls" onSubmit={handleXlsUpload}>
                            <input ref={inputXlsRef} onChange={handleXlsFile} type="file" accept='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' />
                            <input ref={buttonXlsRef} type="submit" />
                        </form>
                        <Button onClick={handleXls} disabled={busy || errorPage} variant="contained">Excel Yükle</Button>                    
                    </>                    
                )}
                {mode === "edit" && <Typography fontWeight="bold" sx={{display: "flex", alignItems: "center"}}>
                    {`Düzenlenecek Kayıt Sayısı: ${editedRows.length}`}
                </Typography>}
                {mode.startsWith("delete") && <Typography fontWeight="bold" sx={{display: "flex", alignItems: "center"}}>
                    {`Silinecek Kayıt Sayısı: ${deletedRows.length}`}
                </Typography>}
                <Tooltip title="Diğer">
                    <ToolbarButton
                        ref={otherMenuRef}
                        id="datagrid-other-menu-trigger"
                        onClick={() => setOtherMenuOpen(true)}
                    >
                        <MoreVert fontSize="small" />
                    </ToolbarButton>
                </Tooltip>
                <Menu
                    id="datagrid-other-menu"
                    anchorEl={otherMenuRef.current}
                    open={otherMenuOpen}
                    onClose={() => setOtherMenuOpen(false)}
                    onClick={() => setOtherMenuOpen(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <FilterPanelTrigger render={<MenuItem />}>Filtre</FilterPanelTrigger>
                    {!mode.startsWith("add") && <ExportCsv render={<MenuItem />}>CSV Olarak Dışa Aktar</ExportCsv>}
                    {mode.startsWith("add") && <MenuItem disabled={rows.length === 0} onClick={() => setRows([])}>Tabloyu Sıfırla</MenuItem>}
                </Menu>
            </div>
        </Toolbar>
    );
}

const CustomDateFilter = (props) => {
    const { item, dateformat, applyValue, apiRef } = props;
    // console.log(dateformat, item.value)
  
    const handleFilterChange = (newValue) => {
        applyValue({ ...item, value: newValue?.format(dateformat)});
    };
  
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
                value={dayjs(item.value, dateformat)}
                onChange={handleFilterChange}
                autoFocus
                label={apiRef.current.getLocaleText('filterPanelInputLabel')}
                slotProps={{ textField: { size: 'small', error: false } }}
                views={['year', 'month', 'day']}
                format={dateformat}
                dayOfWeekFormatter={(weekday) => weekday.format('dd')}
            />
        </LocalizationProvider>        
    );
};

const CustomDateTimeFilter = (props) => {
    const { item, dateformat, applyValue, apiRef } = props;
    // console.log(dateformat, item.value)
  
    const handleFilterChange = (newValue) => {
        applyValue({ ...item, value: newValue?.format(dateformat)});
    };
  
    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
                ampm={false}
                value={dayjs(item.value, dateformat)}
                onChange={handleFilterChange}
                autoFocus
                label={apiRef.current.getLocaleText('filterPanelInputLabel')}
                slotProps={{ textField: { size: 'small', error: false }, actionBar: {sx: {display: "none"}} }}
                views={['year', 'month', 'day', 'hours', 'minutes']}
                format={dateformat}
                dayOfWeekFormatter={(weekday) => weekday.format('dd')}
                timeSteps={{hours: 1, minutes: 1, seconds: 1}}
            />
        </LocalizationProvider>        
    );
}

// bu fonksiyon node_modules/@mui/x-data-grid/colDef/gridDateOperators.js dosyasından alındı ve dayjs ile parse eklendi
const buildApplyFilterFn = (filterItem, format, compareFn, showTime, keepHours) => {
    // console.log(filterItem.value)
    if (!filterItem.value) {
        return null;
    }
    const date = dayjs(filterItem.value, format).toDate()
    console.log(dayjs(filterItem.value, format).format(format), date)
    if (showTime) {
        date.setSeconds(0, 0);
    } 
    else {
        // date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
        date.setHours(0, 0, 0, 0);
    }
    const time = date.getTime();
    return value => {
        if (!value) {
            return false;
        }
        if (keepHours) {
            return compareFn(value.getTime(), time);
        }
        const dateCopy = new Date(value);
        if (showTime) {
            dateCopy.setSeconds(0, 0);
        } 
        else {
            dateCopy.setHours(0, 0, 0, 0);
        }
        return compareFn(dateCopy.getTime(), time);
    };
};

export default CustomDataGrid;