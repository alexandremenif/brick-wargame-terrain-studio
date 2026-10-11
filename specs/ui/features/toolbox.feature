@ui @wip
Feature: Web Studio Canvas Interaction

  Scenario: Selecting the brush tool in the toolbox
    Given the Web Studio is loaded in the browser
    When I select the "Brush" tool
    And I pick the color "Bright Green"
    Then the active tool should be "Brush"
    And the selected color should be "Bright Green"
