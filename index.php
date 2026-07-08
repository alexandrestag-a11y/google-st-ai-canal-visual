<?php
/**
 * Canal Visual - KingHost Backend Bridge
 * Este arquivo permite que o frontend React se comunique com o servidor PHP/MySQL na KingHost
 * se necessário, ou apenas gerencie o roteamento.
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Se for um ambiente que exige PHP para persistência:
// Aqui poderíamos migrar a lógica do db.json para MySQL via PHPmyadmin

$request_uri = $_SERVER['REQUEST_URI'];

if (strpos($request_uri, '/api/') !== false) {
    // Proxy para o banco de dados ou lógica de API
    // Por enquanto, o sistema roda em Node.js (Express), mas este arquivo serve de base
    // para migração para PHP se a hospedagem KingHost assim exigir no futuro.
    echo json_encode(["status" => "Canal Visual API Bridge Active"]);
    exit;
}

// Servir o index.html do React
include('index.html');
?>
