import NavBar from "../navBar/navBar";

const Inicio = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <NavBar />
      <div className="text-center mt-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-slate-400">Bienvenido al sistema de la clinica</p>
      </div>
    </div>
  );
}

export default Inicio;
