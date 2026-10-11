Feature: JSON-RPC 2.0 Wire Protocol & OpenRPC Conformance

  Background:
    Given a running JSON-RPC server with an active map of 100 by 100 studs

  Scenario: Successfully dispatching a valid OpenRPC method
    When I send a JSON-RPC request for "paintArea" with valid bounding box (5, 5, 10, 10) and color ID 1
    Then the JSON-RPC response should contain a successful result
    And the response should report exactly 100 affected cells

  Scenario: Rejecting request with invalid parameters via code -32602
    When I send a JSON-RPC request for "paintArea" with missing width and height
    Then the JSON-RPC response should contain error code -32602

  Scenario: Rejecting unknown method via code -32601
    When I send a JSON-RPC request for "unknown.method"
    Then the JSON-RPC response should contain error code -32601
