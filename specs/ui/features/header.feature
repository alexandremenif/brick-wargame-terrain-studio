@ui
Feature: Top Header Bar Interactions

  Background:
    Given the UI is loaded with an active asset named "Modular Outpost" of 32 by 32 studs

  Scenario: Displaying asset name and dimensions
    Then the header should display asset name "Modular Outpost"
    And the width input should be 32
    And the height input should be 32

  Scenario: Updating asset dimensions via header inputs
    When I change the width input to 48
    And I change the height input to 24
    Then the asset width should be updated to 48 studs
    And the asset height should be updated to 24 studs

  Scenario: Enforcing strictly positive dimension inputs
    When I attempt to enter a width of 0
    Then the width input should revert to 1
