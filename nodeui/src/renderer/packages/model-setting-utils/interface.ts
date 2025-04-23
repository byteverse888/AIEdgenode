import { ModelSettings, Session, SessionType, Settings, ModelOptionGroup } from 'src/shared/types'

export interface ModelSettingUtil {
  // 用在消息下面展示的模型名称
  getCurrentModelDisplayName(settings: Settings, sessionType: SessionType): Promise<string>
  // 当前选中的provider中选中的具体模型
  getCurrentModelOptionValue(settings: Settings): string
  // 更改选中的模型
  selectSessionModel(settings: Session['settings'], selectedModel: string): Session['settings']
  // 获取该provider在代码里写死的模型组
  getLocalOptionGroups(settings: ModelSettings): ModelOptionGroup[]
  // 获取该provider远程的模型组
  getMergeOptionGroups(settings: ModelSettings): Promise<ModelOptionGroup[]>
  // 判断模型对feature的支持
  isCurrentModelSupportImageInput(settings: ModelSettings): boolean
  isCurrentModelSupportToolUse(settings: ModelSettings): boolean
}
