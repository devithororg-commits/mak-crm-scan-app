import { useState } from 'react'
import { useCreative } from '../../store/CreativeContext'
import type { EditSection } from '../../types/creative'
import { TEMPLATES } from '../../data/config'
import ExportPanel from './ExportPanel'
import CanvaToolRail from './CanvaToolRail'
import CanvaToolPanel, { CanvaPanelHeader, CanvaTemplatesFooter } from './CanvaToolPanel'

export default function EditorPanel() {
  const { activeTab, setActiveTab, editSection, setEditSection, data } = useCreative()
  const [exportOpen, setExportOpen] = useState(false)
  const templateName = TEMPLATES.find((t) => t.id === data.templateId)?.name ?? 'Template'

  const panelMode = activeTab === 'templates' ? 'templates' : editSection

  const startEditing = () => {
    setActiveTab('edit')
    setEditSection('content')
  }

  return (
    <aside className="relative flex h-full w-[392px] shrink-0 border-r border-slate-200/80 bg-[#f0f2f5]">
      <CanvaToolRail
        activeTab={activeTab}
        editSection={editSection}
        exportOpen={exportOpen}
        onSelectTemplates={() => { setActiveTab('templates'); setExportOpen(false) }}
        onSelectTool={(section: EditSection) => { setActiveTab('edit'); setEditSection(section); setExportOpen(false) }}
        onExport={() => setExportOpen(true)}
      />

      <div className="relative flex min-w-0 flex-1 flex-col bg-white">
        {exportOpen ? (
          <ExportPanel onClose={() => setExportOpen(false)} />
        ) : (
          <>
            <CanvaPanelHeader mode={panelMode} templateName={templateName} />

            <div className="flex-1 overflow-y-auto px-3.5 py-3.5">
              <CanvaToolPanel
                mode={panelMode}
                templateName={templateName}
                onChangeTemplate={() => setActiveTab('templates')}
              />
            </div>

            {activeTab === 'templates' && (
              <CanvaTemplatesFooter templateName={templateName} onStartEditing={startEditing} />
            )}
          </>
        )}
      </div>
    </aside>
  )
}
