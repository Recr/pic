import { TextAlignJustify, X } from 'lucide-react'
import { useState } from 'react'

const Sidebar: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  return (
    <div className="fixed top-0 left-0 z-50">
      {isSidebarOpen && (
        <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0">
          <div
            className="flex flex-col gap-4 p-4 bg-gray-200 h-screen w-60"
            onClick={(e) => e.stopPropagation()}
          >
            <X
              onClick={() => setIsSidebarOpen(false)}
              className="hover:cursor-pointer hover:text-red-500 transition-all hover:size-7"
            />
            <a href="/" className="hover:cursor-pointer hover:bg-gray-300 p-2 rounded">
              Formulário de Sugestões
            </a>
            <a
              href="/suggestion-list"
              className="hover:cursor-pointer hover:bg-gray-300 p-2 rounded"
            >
              Lista de Sugestões
            </a>
            <a
              href="/admin/define-champion"
              className="hover:cursor-pointer hover:bg-gray-300 p-2 rounded"
            >
              Definir Campeão
            </a>
            <a href="/employee" className="hover:cursor-pointer hover:bg-gray-300 p-2 rounded">
              Colaboradores
            </a>
            <a href="/areas" className="hover:cursor-pointer hover:bg-gray-300 p-2 rounded">
              Áreas
            </a>
            <a href="/proposals" className="hover:cursor-pointer hover:bg-gray-300 p-2 rounded">
              Propostas
            </a>
          </div>
        </div>
      )}
      {!isSidebarOpen && (
        <TextAlignJustify
          onClick={() => setIsSidebarOpen(true)}
          className="ml-4 mt-4 hover:cursor-pointer hover:text-blue-500 transition-all hover:size-7"
        />
      )}
    </div>
  )
}

export default Sidebar
