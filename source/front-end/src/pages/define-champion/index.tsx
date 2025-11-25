function DefineChampion () {
  return (
    <>
      <h2>Atribuir Champion</h2>
        <div className="flex">
          <div className="w-20">
            <span>Sugestão #xyz</span>
            <div>
              <span>Área: </span><p>Metalização</p>
            </div>
            <div>
              <p>Colaboradores: </p>
              <ul>
                <li>Eliel (RE: 10283) - Turno: ADM</li>
                <li>Fulano</li>
                <li>Someone</li>
              </ul>
            </div>
            <label><strong>Definir Champion:</strong></label>
            <input 
              type="text" 
              id="champion-input" 
              name="champion" 
              placeholder="Pesquisar Champion por nome ou RE"
              list="employees-list"
            />
            <datalist id="employees-list"></datalist>
            <button>Definir Champion</button>
          </div>
        </div>
      </>
  )
}

export default DefineChampion