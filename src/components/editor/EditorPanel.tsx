import { useCreative } from '../../store/CreativeContext'
import { useEditorUI } from '../../context/EditorUIContext'
import { useIsMobile } from '../../hooks/useMediaQuery'
import ExportPanel from './ExportPanel'
import CanvaToolRail from './CanvaToolRail'
import CanvaToolPanel, { CanvaPanelHeader, CanvaTemplatesFooter } from './CanvaToolPanel'
import { TEMPLATES } from '../../data/config'
import type { EditSection } from '../../types/creative'

export default function EditorPanel() {
  const { activeTab, setActiveTab, editSection, setEditSection, data } = useCreative()
  const { exportOpen, setExportOpen, mobilePanelOpen, setMobilePanelOpen } = useEditorUI()
  const isMobile = useIsMobile()
  const templateName = TEMPLATES.find((t) => t.id === data.templateId)?.name ?? 'Template'
  const panelMode = activeTab === 'templates' ? 'templates' : editSection

  const startEditing = () => {
    setActiveTab('edit')
    setEditSection('content')
    if (isMobile) setMobilePanelOpen(false)
  }

  const selectTool = (section: EditSection) => {
    setActiveTab('edit')
    setEditSection(section)
    setExportOpen(false)
  }

  const showPanel = !isMobile || mobilePanelOpen

  return (
    <>
      {isMobile && !mobilePanelOpen && (
        <div className="absolute bottom-20 left-1/2 z-30 -translate-x-1/2 lg:hidden">
          <button
            type="button"
            onClick={() => setMobilePanelOpen(true)}
            className="rounded-full bg-[#8b3dff] px-5 py-2.5 text-[13px] font-bold text-white shadow-lg shadow-violet-500/30"
          >
            Open editor tools
          </button>
        </div>
      )}

      <aside
        className={`relative flex h-full shrink-0 border-r border-slate-200/80 bg-[#f0f2f5] transition-transform duration-200 ${
          isMobile
            ? `absolute inset-y-0 left-0 z-40 w-[min(100vw,420px)] shadow-2xl ${showPanel ? 'translate-x-0' : '-translate-x-full'}`
            : 'w-[392px]'
        }`}
      >
        <CanvaToolRail
          activeTab={activeTab}
          editSection={editSection}
          exportOpen={exportOpen}
          onSelectTemplates={() => { setActiveTab('templates'); setExportOpen(false) }}
          onSelectTool={selectTool}
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

        {isMobile && showPanel && (
          <button
            type="button"
            onClick={() => setMobilePanelOpen(false)}
            className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 rounded-full border border-slate-200 bg-white p-1.5 text-slate-500 shadow-md sm:flex"
            title="Hide panel"
          >
            ×
          </button>
        )}
      </aside>

      {isMobile && showPanel && (
        <button
          type="button"
          aria-label="Close editor"
          className="fixed inset-0 z-30 bg-slate-900/20 lg:hidden"
          onClick={() => setMobilePanelOpen(false)}
        />
      )}
    </>
  )
}
