@ui
Feature: Right Inspector Sidebar & Bounding Box Controls

  Background:
    Given the UI is loaded with an active asset of 32 by 32 studs

  Scenario: Editing bounding box coordinates in the inspector
    When I enter bounding box coordinates X 4, Y 6, Width 10, Height 8
    Then the inspector inputs should reflect X 4, Y 6, Width 10, Height 8
    And the viewport should highlight the bounding box at (4, 6, 10, 8)

  Scenario: Framing the entire asset via Fit to Asset action
    When I click the "Fit to Asset" button in the inspector
    Then the inspector inputs should reflect X 0, Y 0, Width 32, Height 32
    And the viewport should highlight the bounding box framing the entire asset

  Scenario: Filling the framed bounding box area
    Given I enter bounding box coordinates X 2, Y 2, Width 4, Height 4
    And I select the LEGO color swatch "Reddish Brown"
    When I click the "Fill Bounding Box" button in the inspector
    Then exactly 16 studs should be painted
    And the studs in bounding box (2, 2, 4, 4) should have color "Reddish Brown"
