from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)

def test_get_status():
    # GET request
    response = client.get('/status')
    
    # Assert request is successful
    assert response.status_code == 200
    
    # Assert JSON payload matches the expected structure
    data = response.json()
    assert data['status'] == 'online'
    assert data['database'] == 'connected'
    assert "indexed_documents" in data
    assert type(data['indexed_documents']) is int
    