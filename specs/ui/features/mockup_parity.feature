@ui
Feature: Visual and Structural Parity with Declarative HTML Mockups

  Background:
    Given the UI is loaded with an active asset named "Modular Outpost" of 32 by 32 studs

  @TEST-UI-PARITY-01
  Scenario: Live studio UI matches main_editor HTML mockup
    Then the live UI should structurally and visually match the "main_editor" mockup

  @TEST-UI-PARITY-02
  Scenario: Delete Asset confirmation dialog matches delete_asset_modal HTML mockup
    When I click the "Delete" button in the header
    Then the live UI should structurally and visually match the "delete_asset_modal" mockup
