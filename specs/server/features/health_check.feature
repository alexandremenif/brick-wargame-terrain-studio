Feature: HTTP Server Health Check Endpoint

  Background:
    Given a running HTTP server

  Scenario Outline: Querying health check for readiness
    When I send an HTTP GET request to "<path>"
    Then the response status code should be 200
    And the response Content-Type should be "application/json"
    And the response Cache-Control header should be "no-cache, no-store, must-revalidate"
    And the response Pragma header should be "no-cache"
    And the response JSON should contain "status" with value "ok"

    Examples:
      | path     |
      | /health  |
      | /health/ |

  Scenario: Querying health check with HEAD method
    When I send an HTTP HEAD request to "/health"
    Then the response status code should be 200
    And the response Content-Type should be "application/json"
    And the response Cache-Control header should be "no-cache, no-store, must-revalidate"
    And the response Pragma header should be "no-cache"
    And the response body should be empty

  Scenario: Rejecting unsupported method on health endpoint
    When I send an HTTP POST request to "/health"
    Then the response status code should be 405
    And the response Content-Type should be "application/json"
    And the response JSON should contain "error" with value "Method Not Allowed"
