import { TextField, Slider, Typography, Box } from '@mui/material'
import { useTranslation } from 'react-i18next'

export function toBeRemoved_getContextMessageCount(
  openaiMaxContextMessageCount: number,
  maxContextMessageCount?: number
) {
  return typeof maxContextMessageCount === 'number'
    ? maxContextMessageCount
    : openaiMaxContextMessageCount > 20
    ? Number.MAX_SAFE_INTEGER
    : openaiMaxContextMessageCount
}

export interface Props {
  value: number
  onChange(value: number): void
  className?: string
}

const MESSAGE_COUNT_OPTIONS = [0, 2, 4, 6, 8, 10, 20, 30, 50, 100, 200, 300, 400, 500, Number.MAX_SAFE_INTEGER]

export default function MaxContextMessageCountSlider(props: Props) {
  const { t } = useTranslation()
  const index = MESSAGE_COUNT_OPTIONS.findLastIndex((v) => v <= props.value)
  return (
    <Box sx={{ margin: '10px' }} className={props.className}>
      <Box>
        <Typography id="discrete-slider" gutterBottom>
          {t('Max Message Count in Context')}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          margin: '0 auto',
        }}
      >
        <Box sx={{ width: '92%' }}>
          <Slider
            value={index}
            onChange={(_event, value) => {
              const v = Array.isArray(value) ? value[0] : value
              props.onChange(MESSAGE_COUNT_OPTIONS[v])
            }}
            aria-labelledby="discrete-slider"
            valueLabelDisplay="auto"
            step={1}
            min={0}
            max={MESSAGE_COUNT_OPTIONS.length - 1}
            marks
            valueLabelFormat={(value) => {
              if (value === MESSAGE_COUNT_OPTIONS.indexOf(Number.MAX_SAFE_INTEGER)) {
                return t('No Limit')
              }
              return MESSAGE_COUNT_OPTIONS[value]
            }}
          />
        </Box>
        <TextField
          sx={{ marginLeft: 2, width: '100px' }}
          value={props.value === Number.MAX_SAFE_INTEGER ? t('No Limit') : props.value}
          onChange={(event) => {
            const s = event.target.value.trim()
            const v = parseInt(s)
            if (isNaN(v)) {
              return
            }
            props.onChange(v)
          }}
          type="text"
          size="small"
          variant="outlined"
        />
      </Box>
    </Box>
  )
}
