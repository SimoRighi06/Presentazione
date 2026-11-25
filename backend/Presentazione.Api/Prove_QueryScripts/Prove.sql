SELECT 
    c.Id AS ID_Cliente,
    c.Name AS NomeCliente,
    c.Slug,
    p.Id ID_Configurazione,
    p.Title AS TitoloConfig
FROM Clients c
LEFT JOIN PresentationConfigs p ON c.Id = p.ClientId;


/* DELETE FROM PresentationConfigs
WHERE ClientId = 1; */

-- UPDATE PresentationConfigs
-- SET ConfigJson = '{"tema": "default", "colore": "blu", "hasPresentation": true, "active": true}'
-- WHERE ConfigJson LIKE '%theme%'; */

select c.id, c.Name as Nome_Cliente , p.Title as Nome_Configurazione
from Clients c
join PresentationConfigs p on c.Id = p.ClientId
where c.id between 1 and 20;

select c.Name, p.UpdatedAt, p.CreatedAt
from Clients c
join PresentationConfigs p on c.id = p.ClientId;

SELECT c.Id, c.Name AS Nome_Cliente, COUNT(p.Id) AS Num_Configurazioni, p.ConfigJson
FROM Clients c 
JOIN PresentationConfigs p ON c.Id = p.ClientId
GROUP BY c.Id, c.Name
HAVING COUNT(p.Id) > 1;

-- update PresentationConfigs
-- set UpdatedAt = datetime(UpdatedAt, '+2 hours'); 

