import { MobileDatePicker } from '@mui/x-date-pickers/MobileDatePicker';
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

const CustomDate = (props) => {
    const handleChange = (val) => {
        console.log(val ? val.format(props.format) : "");
        props.onChange({target: {value: val ? val.format(props.format) : ""}}, props.k)
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MobileDatePicker 
                closeOnSelect={true}
                key={props.k}
                disabled={props.disabled}
                label={props.label}
                value={dayjs(props.value, props.format)}
                enableAccessibleFieldDOMStructure={false}
                sx={{minHeight: "45px"}}
                onChange={handleChange}
                views={['year', 'month', 'day']}
                format={props.format}
                dayOfWeekFormatter={(weekday) => weekday.format('dd')}
                slotProps={{
                    toolbar: {hidden: true},
                    textField: {
                        fullWidth: true,
                        size: "small",
                        error: props.error.err,
                        helperText:  props.error.htxt,
                        variant: "standard",
                        required: props.required,
                        slotProps: {inputLabel: {sx: {fontSize: "14px"}}}
                    }
                }} />
        </LocalizationProvider>
    );
};

export default CustomDate;