const Footer: React.FC = () => {
  return (
    <footer className="mb-2 mr-2 text-right text-sm text-gray-500">
      <p>{new Date().getFullYear()} ePIC</p>
      <p>Versão {__GIT_VERSION__}</p>
    </footer>
  )
}

export default Footer
