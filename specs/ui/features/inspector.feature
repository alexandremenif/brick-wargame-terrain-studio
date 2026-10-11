@ui
Feature: Right Inspector Sidebar & Minimap

  Background:
    Given the UI is loaded with an active asset of 32 by 32 studs

  Scenario: Valid bounding box parameters update the viewport and minimap indicator
    When I enter bounding box coordinates X 4, Y 6, Width 10, Height 8
    Then the inspector inputs should reflect X 4, Y 6, Width 10, Height 8
    And the canvas viewport should frame the subregion (4, 6, 10, 8)
    And the minimap should display the bounding box indicator at position (4, 6, 10, 8) on the 32 by 32 asset

  Scenario: Rejecting invalid bounding box coordinates
    Given the bounding box is currently at X 4, Y 6, Width 10, Height 8
    When I enter bounding box coordinate X 30
    Then the input should be rejected and revert to X 4
    And the canvas viewport framing should remain at (4, 6, 10, 8)

  Scenario: Rejecting non-positive bounding box dimensions
    Given the bounding box is currently at X 4, Y 6, Width 10, Height 8
    When I enter bounding box Width 0
    Then the input should be rejected and revert to Width 10
    And the canvas viewport framing should remain at (4, 6, 10, 8)

  Scenario: Framing the entire asset via Fit to Asset action
    When I click the "Fit to Asset" button in the inspector
    Then the inspector inputs should reflect X 0, Y 0, Width 32, Height 32
    And the canvas viewport should frame the full asset (0, 0, 32, 32)
    And the minimap bounding box indicator should cover the entire 32 by 32 asset
