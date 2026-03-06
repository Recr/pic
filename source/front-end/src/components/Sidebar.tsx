import {
  BoxSelectIcon,
  FormIcon,
  LandPlotIcon,
  Lightbulb,
  ListIcon,
  PersonStandingIcon,
  TextAlignJustify,
  X,
} from 'lucide-react'
import { useState } from 'react'

const Sidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  return (
    <aside
      className={`flex flex-col gap-4 p-4 bg-gray-200 h-screen transition-all duration-300 ease-in-out ${
        isSidebarOpen ? 'w-64' : 'w-16'
      }`}
    >
      {!isSidebarOpen && (
        <TextAlignJustify
          onClick={() => setIsSidebarOpen(true)}
          className="hover:cursor-pointer hover:text-red-500 transition-all hover:size-7 flex-shrink-0"
        />
      )}
      {isSidebarOpen && (
        <X
          onClick={() => setIsSidebarOpen(false)}
          className="hover:cursor-pointer hover:text-red-500 transition-all hover:size-7 flex-shrink-0"
        />
      )}
      <div className="flex items-center gap-2">
        <FormIcon className="hover:cursor-pointer hover:text-red-500 transition-all hover:size-7 flex-shrink-0" />
        {isSidebarOpen && (
          <a
            href="/"
            className="hover:cursor-pointer hover:bg-gray-300 px-2 rounded whitespace-nowrap"
          >
            Formulário de Sugestões
          </a>
        )}
      </div>
      <div className="flex items-center gap-2">
        <ListIcon className="hover:cursor-pointer hover:text-red-500 transition-all hover:size-7 flex-shrink-0" />
        {isSidebarOpen && (
          <a
            href="/suggestion-list"
            className="hover:cursor-pointer hover:bg-gray-300 px-2 rounded whitespace-nowrap"
          >
            Lista de Sugestões
          </a>
        )}
      </div>
      <div className="flex items-center gap-2">
        <BoxSelectIcon className="hover:cursor-pointer hover:text-red-500 transition-all hover:size-7 flex-shrink-0" />
        {isSidebarOpen && (
          <a
            href="/admin/define-champion"
            className="hover:cursor-pointer hover:bg-gray-300 px-2 rounded whitespace-nowrap"
          >
            Definir Campeão
          </a>
        )}
      </div>
      <div className="flex items-center gap-2">
        <PersonStandingIcon className="hover:cursor-pointer hover:text-red-500 transition-all hover:size-7 flex-shrink-0" />
        {isSidebarOpen && (
          <a
            href="/employee"
            className="hover:cursor-pointer hover:bg-gray-300 px-2 rounded whitespace-nowrap"
          >
            Colaboradores
          </a>
        )}
      </div>
      <div className="flex items-center gap-2">
        <LandPlotIcon className="hover:cursor-pointer hover:text-red-500 transition-all hover:size-7 flex-shrink-0" />
        {isSidebarOpen && (
          <a
            href="/areas"
            className="hover:cursor-pointer hover:bg-gray-300 px-2 rounded whitespace-nowrap"
          >
            Áreas
          </a>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Lightbulb className="hover:cursor-pointer hover:text-red-500 transition-all hover:size-7 flex-shrink-0" />
        {isSidebarOpen && (
          <a
            href="/proposals"
            className="hover:cursor-pointer hover:bg-gray-300 px-2 rounded whitespace-nowrap"
          >
            Propostas
          </a>
        )}
      </div>
    </aside>
  )
}

export default Sidebar
