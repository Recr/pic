function DefineChampion () {
  return (
    <>
      <h2>Atribuir Champion</h2>
        <div>
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
      </>
  )
}

export default DefineChampion