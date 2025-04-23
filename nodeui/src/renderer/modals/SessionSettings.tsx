import {
  ModelProvider,
  ModelSettings,
  Session,
  createMessage,
  isChatSession,
  isPictureSession,
} from '@/../shared/types'
import { Accordion, AccordionDetails, AccordionSummary } from '@/components/Accordion'
import AIProviderSelect from '@/components/AIProviderSelect'
import CreatableSelect from '@/components/CreatableSelect'
import EditableAvatar from '@/components/EditableAvatar'
import { ImageInStorage, handleImageInputAndSave } from '@/components/Image'
import ImageCountSlider from '@/components/ImageCountSlider'
import ImageStyleSelect from '@/components/ImageStyleSelect'
import MaxContextMessageCountSlider, {
  toBeRemoved_getContextMessageCount,
} from '@/components/MaxContextMessageCountSlider'
import ChatboxAIModelSelect from '@/components/model-select/ChatboxAIModelSelect'
import ChatGLMModelSelect from '@/components/model-select/ChatGLMModelSelect'
import ClaudeModelSelect from '@/components/model-select/ClaudeModelSelect'
import DeepSeekModelSelect from '@/components/model-select/DeepSeekModelSelect'
import GeminiModelSelect from '@/components/model-select/GeminiModelSelect'
import GropModelSelect from '@/components/model-select/GroqModelSelect'
import LMStudioModelSelect from '@/components/model-select/LMStudioModelSelect'
import { OllamaModelSelect } from '@/components/model-select/OllamaModelSelect'
import OpenAIModelSelect from '@/components/model-select/OpenAIModelSelect'
import { PerplexityModelSelect } from '@/components/model-select/PerplexityModelSelect'
import { SiliconflowModelSelect } from '@/components/model-select/SiliconflowModelSelect'
import { XAIModelSelect } from '@/components/model-select/XAIModelSelect'
import TemperatureSlider from '@/components/TemperatureSlider'
import TopPSlider from '@/components/TopPSlider'
import { useIsSmallScreen } from '@/hooks/useScreenChange'
import { trackingEvent } from '@/packages/event'
import { OllamaHostInput } from '@/pages/SettingDialog/OllamaSetting'
import { StorageKeyGenerator } from '@/storage/StoreStorage'
import * as atoms from '@/stores/atoms'
import { getSession, saveSession } from '@/stores/session-store'
import * as sessionActions from '@/stores/sessionActions'
import { getMessageText } from '@/utils/message'
import NiceModal, { muiDialogV5, useModal } from '@ebay/nice-modal-react'
import ImageIcon from '@mui/icons-material/Image'
import SmartToyIcon from '@mui/icons-material/SmartToy'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  TextField,
  Typography,
  useTheme,
} from '@mui/material'
import { useAtom, useAtomValue } from 'jotai'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const SessionSettings = NiceModal.create(({ chatConfigDialogSessionId }: { chatConfigDialogSessionId: string }) => {
  const modal = useModal()
  const { t } = useTranslation()
  const isSmallScreen = useIsSmallScreen()
  const globalSettings = useAtomValue(atoms.settingsAtom)
  const theme = useTheme()

  const chatConfigDialogSession = getSession(chatConfigDialogSessionId || '')
  const [editingData, setEditingData] = React.useState<Session | null>(chatConfigDialogSession || null)
  useEffect(() => {
    if (!chatConfigDialogSession) {
      setEditingData(null)
    } else {
      setEditingData({
        ...chatConfigDialogSession,
        settings: chatConfigDialogSession.settings ? { ...chatConfigDialogSession.settings } : undefined,
      })
    }
  }, [chatConfigDialogSessionId])

  const [systemPrompt, setSystemPrompt] = React.useState('')
  useEffect(() => {
    if (!chatConfigDialogSession) {
      setSystemPrompt('')
    } else {
      const systemMessage = chatConfigDialogSession.messages.find((m) => m.role === 'system')
      setSystemPrompt(systemMessage ? getMessageText(systemMessage) : '')
    }
  }, [chatConfigDialogSessionId])

  const onReset = (event: React.MouseEvent) => {
    event.stopPropagation()
    event.preventDefault()
    if (chatConfigDialogSession) {
      setEditingData({
        ...chatConfigDialogSession,
        settings: undefined,
      })
    }
  }

  useEffect(() => {
    if (chatConfigDialogSession) {
      trackingEvent('chat_config_window', { event_category: 'screen_view' })
    }
  }, [chatConfigDialogSessionId])

  const onCancel = () => {
    if (chatConfigDialogSession) {
      setEditingData({
        ...chatConfigDialogSession,
      })
    }
    modal.resolve()
    modal.hide()
  }
  const onSave = () => {
    if (!chatConfigDialogSession || !editingData) {
      return
    }
    if (editingData.name === '') {
      editingData.name = chatConfigDialogSession.name
    }
    editingData.name = editingData.name.trim()
    if (systemPrompt === '') {
      editingData.messages = editingData.messages.filter((m) => m.role !== 'system')
    } else {
      const systemMessage = editingData.messages.find((m) => m.role === 'system')
      if (systemMessage) {
        systemMessage.contentParts = [{ type: 'text', text: systemPrompt.trim() }]
      } else {
        editingData.messages.unshift(createMessage('system', systemPrompt.trim()))
      }
    }
    saveSession(editingData)
    // setChatConfigDialogSessionId(null)
    modal.resolve()
    modal.hide()
  }

  if (!chatConfigDialogSession || !editingData) {
    return null
  }

  return (
    <Dialog
      {...muiDialogV5(modal)}
      onClose={() => {
        modal.resolve()
        modal.hide()
      }}
      fullWidth
    >
      <DialogTitle>{t('Conversation Settings')}</DialogTitle>
      <DialogContent>
        <DialogContentText></DialogContentText>
        <EditableAvatar
          onChange={(event) => {
            const key = StorageKeyGenerator.picture(`assistant-avatar:${chatConfigDialogSession?.id}`)
            handleImageInputAndSave(event, key, () => setEditingData({ ...editingData, assistantAvatarKey: key }))
          }}
          onRemove={() => {
            setEditingData({ ...editingData, assistantAvatarKey: undefined })
          }}
          removable={!!editingData.assistantAvatarKey}
          sx={{
            backgroundColor:
              editingData.type === 'picture'
                ? theme.palette.secondary.main
                : editingData.picUrl
                ? theme.palette.background.default
                : theme.palette.primary.main,
          }}
        >
          {editingData.assistantAvatarKey ? (
            <ImageInStorage
              storageKey={editingData.assistantAvatarKey}
              className="object-cover object-center w-full h-full"
            />
          ) : editingData.picUrl ? (
            <img src={editingData.picUrl} className="object-cover object-center w-full h-full" />
          ) : editingData.type === 'picture' ? (
            <ImageIcon
              fontSize="large"
              sx={{
                width: '60px',
                height: '60px',
              }}
            />
          ) : globalSettings.defaultAssistantAvatarKey ? (
            <ImageInStorage
              storageKey={globalSettings.defaultAssistantAvatarKey}
              className="object-cover object-center w-full h-full"
            />
          ) : (
            <SmartToyIcon fontSize="large" />
          )}
        </EditableAvatar>
        <TextField
          autoFocus={!isSmallScreen}
          margin="dense"
          label={t('name')}
          type="text"
          fullWidth
          variant="outlined"
          value={editingData.name}
          onChange={(e) => setEditingData({ ...editingData, name: e.target.value })}
        />
        <div className="mt-1">
          <TextField
            margin="dense"
            label={t('Instruction (System Prompt)')}
            placeholder={t('Copilot Prompt Demo') || ''}
            fullWidth
            variant="outlined"
            multiline
            minRows={2}
            maxRows={8}
            value={systemPrompt}
            onChange={(event) => setSystemPrompt(event.target.value)}
          />
        </div>
        <Accordion defaultExpanded={!!editingData.settings} className="mt-2">
          <AccordionSummary aria-controls="panel1a-content">
            <div className="flex flex-row w-full justify-between items-center">
              <Typography>{t('Specific model settings')}</Typography>
              {editingData.settings && (
                <Button size="small" variant="text" color="warning" onClick={onReset}>
                  {t('Reset to Global Settings')}
                </Button>
              )}
            </div>
          </AccordionSummary>
          <AccordionDetails>
            {isChatSession(chatConfigDialogSession) && (
              <ChatConfig dataEdit={editingData} setDataEdit={setEditingData} />
            )}
            {isPictureSession(chatConfigDialogSession) && (
              <PictureConfig dataEdit={editingData} setDataEdit={setEditingData} />
            )}
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{t('cancel')}</Button>
        <Button onClick={onSave}>{t('save')}</Button>
      </DialogActions>
    </Dialog>
  )
})

export default SessionSettings

function ChatConfig(props: { dataEdit: Session; setDataEdit: (data: Session) => void }) {
  const { dataEdit, setDataEdit } = props
  const { t } = useTranslation()
  const licenseDetail = useAtomValue(atoms.licenseDetailAtom)
  // 全局设置
  const [globalSettings, setGlobalSettings] = useAtom(atoms.settingsAtom)
  // 会话生效设置 = 全局设置 + 会话设置
  const mergedSettings = sessionActions.mergeSettings(globalSettings, dataEdit.settings || {}, dataEdit.type || 'chat')
  // 修改当前会话设置
  const updateSettingsEdit = (updated: Partial<ModelSettings>) => {
    setDataEdit({
      ...dataEdit,
      settings: {
        ...(dataEdit.settings || {}),
        ...updated,
      },
    })
  }
  const specificSettings = dataEdit.settings || {}

  // 当前选择的自定义提供方的全局设置
  const globalCustomProvider = globalSettings.customProviders.find(
    (provider) => provider.id === mergedSettings.selectedCustomProviderId
  )
  // 当前选择的自定义提供方的选中模型
  const sessionCustomProviderModel = (
    mergedSettings.customProviders.find((provider) => provider.id === mergedSettings.selectedCustomProviderId) ||
    globalCustomProvider
  )?.model

  return (
    <>
      <AIProviderSelect
        aiProvider={mergedSettings.aiProvider}
        onSwitchAIProvider={(v) => updateSettingsEdit({ aiProvider: v })}
        selectedCustomProviderId={mergedSettings.selectedCustomProviderId}
        onSwitchCustomProvider={(v) =>
          updateSettingsEdit({
            aiProvider: ModelProvider.Custom,
            selectedCustomProviderId: v,
          })
        }
        className={specificSettings.aiProvider === undefined ? 'opacity-50' : ''}
        hideCustomProviderManage
      />
      <Divider sx={{ margin: '16px 0' }} />
      {mergedSettings.aiProvider === ModelProvider.ChatboxAI && (
        <>
          {licenseDetail && (
            <ChatboxAIModelSelect
              settingsEdit={mergedSettings}
              setSettingsEdit={updateSettingsEdit}
              className={specificSettings.chatboxAIModel === undefined ? 'opacity-50' : ''}
            />
          )}
        </>
      )}
      {mergedSettings.aiProvider === ModelProvider.OpenAI && (
        <>
          <OpenAIModelSelect
            settingsEdit={mergedSettings}
            setSettingsEdit={updateSettingsEdit}
            className={specificSettings.model === undefined ? 'opacity-50' : ''}
          />
        </>
      )}
      {mergedSettings.aiProvider === ModelProvider.Azure && (
        <>
          <CreatableSelect
            label={t('Azure Deployment Name')}
            value={mergedSettings.azureDeploymentName}
            onChangeValue={(v) => updateSettingsEdit({ azureDeploymentName: v })}
            // 选项直接读取和修改全局设置，这样用户体验会更好
            options={globalSettings.azureDeploymentNameOptions}
            onUpdateOptions={(v) => {
              setGlobalSettings((globalSettings) => ({
                ...globalSettings,
                azureDeploymentNameOptions: v,
              }))
            }}
            className={specificSettings.azureDeploymentName === undefined ? 'opacity-50' : ''}
          />
        </>
      )}
      {mergedSettings.aiProvider === ModelProvider.ChatGLM6B && (
        <>
          <ChatGLMModelSelect
            settingsEdit={mergedSettings}
            setSettingsEdit={updateSettingsEdit}
            className={specificSettings.chatglmModel === undefined ? 'opacity-50' : ''}
          />
        </>
      )}
      {mergedSettings.aiProvider === ModelProvider.Claude && (
        <>
          <ClaudeModelSelect
            settingsEdit={mergedSettings}
            setSettingsEdit={updateSettingsEdit}
            className={specificSettings.claudeModel === undefined ? 'opacity-50' : ''}
          />
        </>
      )}
      {mergedSettings.aiProvider === ModelProvider.Ollama && (
        <>
          <OllamaHostInput
            ollamaHost={mergedSettings.ollamaHost}
            setOllamaHost={(v) => updateSettingsEdit({ ollamaHost: v })}
            className={specificSettings.ollamaHost === undefined ? 'opacity-50' : ''}
          />
          <OllamaModelSelect
            settingsEdit={mergedSettings}
            setSettingsEdit={updateSettingsEdit}
            className={specificSettings.ollamaModel === undefined ? 'opacity-50' : ''}
          />
        </>
      )}
      {mergedSettings.aiProvider === ModelProvider.Gemini && (
        <>
          <GeminiModelSelect
            settingsEdit={mergedSettings}
            setSettingsEdit={updateSettingsEdit}
            className={specificSettings.geminiModel === undefined ? 'opacity-50' : ''}
          />
        </>
      )}
      {mergedSettings.aiProvider === ModelProvider.Groq && (
        <>
          <GropModelSelect
            settingsEdit={mergedSettings}
            setSettingsEdit={updateSettingsEdit}
            className={specificSettings.groqModel === undefined ? 'opacity-50' : ''}
          />
        </>
      )}
      {mergedSettings.aiProvider === ModelProvider.DeepSeek && (
        <>
          <DeepSeekModelSelect
            settingsEdit={mergedSettings}
            setSettingsEdit={updateSettingsEdit}
            className={specificSettings.deepseekModel === undefined ? 'opacity-50' : ''}
          />
        </>
      )}
      {mergedSettings.aiProvider === ModelProvider.SiliconFlow && (
        <>
          <SiliconflowModelSelect
            settingsEdit={mergedSettings}
            setSettingsEdit={updateSettingsEdit}
            className={specificSettings.siliconCloudModel === undefined ? 'opacity-50' : ''}
          />
        </>
      )}
      {mergedSettings.aiProvider === ModelProvider.LMStudio && (
        <>
          <LMStudioModelSelect
            settingsEdit={mergedSettings}
            setSettingsEdit={updateSettingsEdit}
            className={specificSettings.lmStudioModel === undefined ? 'opacity-50' : ''}
          />
        </>
      )}
      {mergedSettings.aiProvider === ModelProvider.Perplexity && (
        <>
          <PerplexityModelSelect
            settingsEdit={mergedSettings}
            setSettingsEdit={updateSettingsEdit}
            className={specificSettings.perplexityModel === undefined ? 'opacity-50' : ''}
          />
        </>
      )}
      {mergedSettings.aiProvider === ModelProvider.XAI && (
        <>
          <XAIModelSelect
            settingsEdit={mergedSettings}
            setSettingsEdit={updateSettingsEdit}
            className={specificSettings.xAIModel === undefined ? 'opacity-50' : ''}
          />
        </>
      )}
      {mergedSettings.aiProvider === ModelProvider.Custom && sessionCustomProviderModel && globalCustomProvider && (
        <>
          <CreatableSelect
            label={t('model')}
            value={sessionCustomProviderModel}
            options={globalCustomProvider.modelOptions || []}
            onChangeValue={(v) => {
              updateSettingsEdit({
                customProviders: mergedSettings.customProviders.map((provider) => {
                  if (provider.id === mergedSettings.selectedCustomProviderId) {
                    return { ...provider, model: v }
                  }
                  return provider
                }),
              })
            }}
            onUpdateOptions={(v) => {
              setGlobalSettings((globalSettings) => ({
                ...globalSettings,
                customProviders: globalSettings.customProviders.map((provider) => {
                  if (provider.id === mergedSettings.selectedCustomProviderId) {
                    return { ...provider, modelOptions: v }
                  }
                  return provider
                }),
              }))
            }}
            className={specificSettings.customProviders === undefined ? 'opacity-50' : ''}
          />
        </>
      )}
      <MaxContextMessageCountSlider
        value={toBeRemoved_getContextMessageCount(
          mergedSettings.openaiMaxContextMessageCount,
          mergedSettings.maxContextMessageCount
        )}
        onChange={(v) => updateSettingsEdit({ maxContextMessageCount: v })}
        className={
          specificSettings.maxContextMessageCount === undefined &&
          specificSettings.openaiMaxContextMessageCount === undefined
            ? 'opacity-50'
            : ''
        }
      />
      <TemperatureSlider
        value={mergedSettings.temperature}
        onChange={(v) => updateSettingsEdit({ temperature: v })}
        className={specificSettings.temperature === undefined ? 'opacity-50' : ''}
      />
      <TopPSlider
        topP={mergedSettings.topP}
        setTopP={(v) => updateSettingsEdit({ topP: v })}
        className={specificSettings.topP === undefined ? 'opacity-50' : ''}
      />
    </>
  )
}

function PictureConfig(props: { dataEdit: Session; setDataEdit: (data: Session) => void }) {
  const { dataEdit, setDataEdit } = props
  const globalSettings = useAtomValue(atoms.settingsAtom)
  const sessionSettings = sessionActions.mergeSettings(globalSettings, dataEdit.settings || {}, dataEdit.type || 'chat')
  const updateSettingsEdit = (updated: Partial<ModelSettings>) => {
    setDataEdit({
      ...dataEdit,
      settings: {
        ...(dataEdit.settings || {}),
        ...updated,
      },
    })
  }
  return (
    <div className="mt-8">
      <ImageStyleSelect
        value={sessionSettings.dalleStyle}
        onChange={(v) => updateSettingsEdit({ dalleStyle: v })}
        className={sessionSettings.dalleStyle === undefined ? 'opacity-50' : ''}
      />
      <ImageCountSlider
        value={sessionSettings.imageGenerateNum}
        onChange={(v) => updateSettingsEdit({ imageGenerateNum: v })}
        className={sessionSettings.imageGenerateNum === undefined ? 'opacity-50' : ''}
      />
    </div>
  )
}
