import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { renderTimeViewClock } from '@mui/x-date-pickers/timeViewRenderers';
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
    months: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
});

const CustomDatetime = (props) => {
    // useEffect(() => {
    //     console.log(dayjs.locale())
    // }, []);

    const handleChange = (val) => {
        console.log(val ? `${val} ${val.format(props.format)}` : "");
        props.onChange({target: {value: val ? val.format(props.format) : ""}}, props.k)
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <MobileDateTimePicker 
                ampm={false}
                closeOnSelect={true}
                key={props.k}
                disabled={props.disabled}
                label={props.label}
                value={dayjs(props.value, props.format)}
                enableAccessibleFieldDOMStructure={false}
                sx={{minHeight: "45px"}}
                onChange={handleChange}
                views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                format={props.format}
                dayOfWeekFormatter={(weekday) => weekday.format('dd')}
                timeSteps={{hours: 1, minutes: 1, seconds: 1}}
                // viewRenderers={{
                //     hours: renderTimeViewClock,
                //     minutes: renderTimeViewClock,
                //     seconds: renderTimeViewClock,
                //   }}
                slotProps={{
                    toolbar: {hidden: true},
                    actionBar: {sx: {display: "none"}},
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

export default CustomDatetime;