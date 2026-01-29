var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();

// OpenAPI / Swagger (plantilla nueva)
builder.Services.AddOpenApi();

// CORS: permitir peticiones desde el frontend (Vite)
var corsPolicyName = "AllowFrontend";
builder.Services.AddCors(options =>
{
    options.AddPolicy(name: corsPolicyName, policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "http://localhost:5174" // <-- agrega este
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    // Si quieres también el UI de Swagger:
    // app.UseSwaggerUI();
}

// Redirección HTTPS
app.UseHttpsRedirection();

// CORS (antes de Authorization)
app.UseCors(corsPolicyName);

app.UseAuthorization();

app.MapControllers();

app.Run();