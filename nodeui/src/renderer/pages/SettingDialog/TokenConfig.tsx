// import React from 'react'
// import { TextField, Slider, Typography, Box } from '@mui/material'
// import { useTranslation } from 'react-i18next'
// import { getTokenLimits } from '../../packages/token_config'
// import { SessionSettings } from '../../../shared/types'

// interface ModelConfigProps {
//     settingsEdit: SessionSettings
//     setSettingsEdit: (settings: SessionSettings) => void
// }

// export default function TokenConfig(props: ModelConfigProps) {
//     const { settingsEdit, setSettingsEdit } = props
//     const { t } = useTranslation()
//     const { maxTokenLimit, minTokenLimit, maxContextTokenLimit, minContextTokenLimit, totalTokenLimit } =
//         getTokenLimits(settingsEdit)
//     const sliderChangeHandler = (key: 'openaiMaxTokens' | 'openaiMaxContextTokens', max: number, min: number) => {
//         return (event: Event, newValue: number | number[], activeThumb: number) => {
//             if (Array.isArray(newValue)) {
//                 newValue = newValue[0]
//             }
//             newValue = Math.floor(newValue)
//             if (newValue > max) {
//                 newValue = max
//             }
//             if (newValue < min) {
//                 newValue = min
//             }
//             const otherKey = key === 'openaiMaxTokens' ? 'openaiMaxContextTokens' : 'openaiMaxTokens'
//             if (newValue + settingsEdit[otherKey] > totalTokenLimit) {
//                 settingsEdit[otherKey] = totalTokenLimit - newValue
//             }
//             settingsEdit[key] = newValue
//             setSettingsEdit({ ...settingsEdit })
//         }
//     }
//     const inputChangeHandler = (key: 'openaiMaxTokens' | 'openaiMaxContextTokens', max: number, min: number) => {
//         return (event: React.ChangeEvent<HTMLInputElement>) => {
//             const raw = event.target.value
//             let newValue = parseInt(raw)
//             if (isNaN(newValue)) {
//                 return
//             }
//             newValue = Math.floor(newValue)
//             if (newValue > max) {
//                 newValue = max
//             }
//             if (newValue < min) {
//                 newValue = min
//             }
//             const otherKey = key === 'openaiMaxTokens' ? 'openaiMaxContextTokens' : 'openaiMaxTokens'
//             if (newValue + settingsEdit[otherKey] > totalTokenLimit) {
//                 settingsEdit[otherKey] = totalTokenLimit - newValue
//             }
//             settingsEdit[key] = newValue
//             setSettingsEdit({ ...settingsEdit })
//         }
//     }
//     return (
//         <Box sx={{ margin: '10px' }}>
//             <Box>
//                 <Typography id="discrete-slider" gutterBottom>
//                     {t('max tokens in context')}
//                 </Typography>
//             </Box>
//             <Box
//                 sx={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     margin: '0 auto',
//                 }}
//             >
//                 <Box sx={{ width: '92%' }}>
//                     <Slider
//                         value={settingsEdit.openaiMaxContextTokens}
//                         onChange={sliderChangeHandler(
//                             'openaiMaxContextTokens',
//                             maxContextTokenLimit,
//                             minContextTokenLimit
//                         )}
//                         aria-labelledby="discrete-slider"
//                         valueLabelDisplay="auto"
//                         step={64}
//                         min={minContextTokenLimit}
//                         max={maxContextTokenLimit}
//                     />
//                 </Box>
//                 <TextField
//                     sx={{ marginLeft: 2, width: '100px' }}
//                     value={settingsEdit.openaiMaxContextTokens}
//                     onChange={inputChangeHandler('openaiMaxContextTokens', maxContextTokenLimit, minContextTokenLimit)}
//                     type="text"
//                     size="small"
//                     variant="outlined"
//                 />
//             </Box>
//             <Box sx={{ marginTop: 3, marginBottom: -1 }}>
//                 <Typography id="discrete-slider" gutterBottom>
//                     {t('max tokens to generate')}
//                 </Typography>
//             </Box>
//             <Box
//                 sx={{
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center',
//                     margin: '0 auto',
//                 }}
//             >
//                 <Box sx={{ width: '92%' }}>
//                     <Slider
//                         value={settingsEdit.openaiMaxTokens}
//                         onChange={sliderChangeHandler('openaiMaxTokens', maxTokenLimit, minTokenLimit)}
//                         aria-labelledby="discrete-slider"
//                         valueLabelDisplay="auto"
//                         step={64}
//                         min={minTokenLimit}
//                         max={maxTokenLimit}
//                     />
//                 </Box>
//                 {settingsEdit.openaiMaxTokens === 0 ? (
//                     <Box sx={{ marginLeft: 2, width: '100px' }}>
//                         <span style={{ padding: '5px' }}>{t('Auto')}</span>
//                     </Box>
//                 ) : (
//                     <TextField
//                         sx={{ marginLeft: 2, width: '100px' }}
//                         value={settingsEdit.openaiMaxTokens}
//                         onChange={inputChangeHandler('openaiMaxTokens', maxTokenLimit, minTokenLimit)}
//                         type="text"
//                         size="small"
//                         variant="outlined"
//                     />
//                 )}
//             </Box>
//         </Box>
//     )
// }
