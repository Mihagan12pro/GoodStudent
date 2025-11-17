using GoodStudent.Web;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddProgramDependencies();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

//app.UseHttpsRedirection();//Пока не нужно

//app.UseAuthorization();//Пока не нужно

app.MapControllers();

app.Run();
