@ui
Feature: Right Inspector Sidebar & Bounding Box Window

  Background:
    Given the UI is loaded with an active asset of 32 by 32 studs

  Scenario: Inspector window updates when changing bounding box parameters
    When I enter bounding box coordinates X 4, Y 6, Width 10, Height 8
    Then the inspector inputs should reflect X 4, Y 6, Width 10, Height 8
    And the inspector window should display the framed bounding box region (4, 6, 10, 8)

  Scenario: Framing the entire asset via Fit to Asset action
    When I click the "Fit to Asset" button in the inspector
    Then the inspector inputs should reflect X 0, Y 0, Width 32, Height 32
    And the inspector window should display the full asset (0, 0, 32, 32)
