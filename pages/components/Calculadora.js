function Calculadora() {
  return (
    <div className="flex flex-col">
      <form>
        {/* Inputs superiores */}
        <div className="join z-2">
          <input
            type="text"
            placeholder="Nome"
            className="input input-warning input-xs w-32 join-item"
            required
          />
          <input
            type="text"
            placeholder="CODIGO"
            className="input input-warning input-xs w-23.5 join-item"
            required
          />
          <div className="badge badge-outline badge-warning join-item">7</div>
        </div>
        <div className="grid grid-cols-6 w-fit">
          {Array.from({ length: 36 }).map((_, i) => (
            <input
              key={i}
              min="0"
              type="number"
              className="input input-info input-xs w-10.5 text-center"
            />
          ))}
        </div>
        <div className="badge badge-soft badge-warning px-26.5 rounded-none join-item">
          SOMA
        </div>
        <div className="join grid grid-cols-3 w-63.5">
          <input
            min="0"
            step={0.01}
            type="number"
            placeholder="Pix"
            className="input input-secondary input-lg z-2 text-center join-item"
          />
          <input
            min="0"
            step={0.01}
            type="number"
            placeholder="Troco"
            className="input input-defaut input-lg text-center join-item"
          />
          <input
            min="0"
            step={0.01}
            type="number"
            placeholder="Real"
            className="input input-secondary input-lg z-2 text-center join-item"
          />
          <button type="submit" className="btn px-31.5 btn-secondary">
            Salvar
          </button>
        </div>
        <input
          type="text"
          placeholder="Comentário"
          className="input input-defaut w-63.5 input-xs"
          required
        />
      </form>
    </div>
  );
}

export default Calculadora;
