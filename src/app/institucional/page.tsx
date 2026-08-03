export default function InstitucionalPage() {
  return (
    <div className="flex-1 mx-auto max-w-3xl px-6 py-12 w-full">
      <h1 className="text-2xl font-semibold text-primary">Institucional</h1>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Quem Somos</h2>
        {/* TODO(cliente): texto institucional sobre a história e a missão da AMMA. */}
        <p className="mt-3 text-muted-foreground">
          A Associação Médica do Médio Araguaia (AMMA) foi fundada em 1981. Texto institucional
          completo em breve.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Diretoria</h2>
        {/* TODO(cliente): nomes e cargos da diretoria atual. */}
        <p className="mt-3 text-muted-foreground">Lista da diretoria atual em breve.</p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Estatuto e Regimentos</h2>
        {/* TODO(cliente): anexar os documentos (PDF) do estatuto e regimentos internos. */}
        <p className="mt-3 text-muted-foreground">Documentos disponíveis em breve.</p>
      </section>
    </div>
  );
}
