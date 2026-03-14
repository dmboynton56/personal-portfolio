export function AboutSection() {
  return (
    <section id="about" className="min-h-screen bg-background-alt flex items-center py-24">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12">About Me</h2>
        <div className="space-y-6 text-lg text-muted-foreground">
          <p>
            I am a software and machine learning engineer focused on building systems that hold up in production,
            not just in notebooks. My strongest work combines data engineering, model development, and product delivery.
          </p>
          <p>
            Most of my recent projects are end-to-end pipelines: data ingestion, feature generation,
            model scoring, API layers, and frontend experiences that expose model outputs in a usable way.
            I regularly work with Python, TypeScript, BigQuery, Supabase/Postgres, and cloud-based AI tooling.
          </p>
          <p>
            This portfolio highlights projects where I can demonstrate measurable outcomes, architectural decisions,
            and operational tradeoffs. If you are evaluating for DS/ML/SWE roles, the flagship systems are the best place to start.
          </p>
        </div>
      </div>
    </section>
  )
}
